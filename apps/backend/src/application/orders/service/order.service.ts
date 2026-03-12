import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { CreateOrderUseCase } from '../useCase/create-order.use-case';
import { CalculatorService } from '../../calculator/service/calculator.service';
import { IProductRepository } from '../../../domain/products/product.repository.interface';
import { CreateOrderDto } from '../../../presentation/dto/create-order.dto';
import { OrderResponseDto } from '../../../presentation/dto/order-response.dto';
import { InventoryLockService } from './inventory-lock.service';

export interface CreateOrderServiceInput {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  memberCardNumber?: string;
  customerIdentifier: string;
}


@Injectable()
export class OrderService {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly calculatorService: CalculatorService,
    private readonly inventoryLockService: InventoryLockService,
    @Inject('PRODUCT_REPOSITORY') private readonly productRepository: IProductRepository,
  ) {}

  async createOrder(input: CreateOrderServiceInput): Promise<OrderResponseDto> {
    const redSetLocks: { productId: number; lockKey?: string }[] = [];
    
    try {
      // Fetch all products in parallel - O(1) database call instead of O(n)
      const productIds = input.items.map(item => item.productId);
      const products = await Promise.all(
        productIds.map(id => this.productRepository.findById(id))
      );

      // Create product map for O(1) lookup - O(n)
      const productMap = new Map<number, any>();
      const itemsWithProducts: Array<{ product: any; quantity: number }> = [];

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (!product) {
          throw new Error(`Product with ID ${productIds[i]} not found`);
        }
        productMap.set(product.id, product);
        itemsWithProducts.push({
          product,
          quantity: input.items[i].quantity,
        });
      }

      // Acquire locks for Red Sets in parallel - O(k) where k = number of Red Sets
      const redSetItems = itemsWithProducts.filter(item => item.product.isRedSet());
      
      if (redSetItems.length > 0) {
        const lockResults = await Promise.all(
          redSetItems.map(item =>
            this.inventoryLockService.acquireRedSetLock(
              item.product.id,
              input.customerIdentifier
            )
          )
        );

        // Check if all locks were acquired
        for (let i = 0; i < lockResults.length; i++) {
          const lockResult = lockResults[i];
          
          if (!lockResult.success) {
            // Release any acquired locks before throwing
            await this.releaseRedSetLocks(redSetLocks, input.customerIdentifier);
            throw new ConflictException(lockResult.message || 'Red Set is currently unavailable');
          }
          
          redSetLocks.push({
            productId: redSetItems[i].product.id,
            lockKey: lockResult.lockKey
          });
        }
      }

      // Create order and calculate in parallel
      const [order, calculation] = await Promise.all([
        this.createOrderUseCase.execute({
          items: input.items,
          memberCardNumber: input.memberCardNumber,
        }),
        Promise.resolve(this.calculatorService.calculate({
          items: itemsWithProducts,
          memberCardNumber: input.memberCardNumber,
        }))
      ]);

      return {
        id: order.id,
        memberCardNumber: order.memberCardNumber,
        totalBeforeDiscount: order.getTotalBeforeDiscountAsNumber(),
        pairDiscount: order.getPairDiscountAsNumber(),
        memberDiscount: order.getMemberDiscountAsNumber(),
        finalTotal: order.getFinalTotalAsNumber(),
        createdAt: order.createdAt.toISOString(),
        items: order.items,
        calculation,
      };

    } catch (error) {
      await this.releaseRedSetLocks(redSetLocks, input.customerIdentifier);
      throw error;
    }
  }

  private async releaseRedSetLocks(
    locks: { productId: number; lockKey?: string }[], 
    customerIdentifier: string
  ): Promise<void> {
    if (locks.length === 0) return;
    
    // Release all locks in parallel
    await Promise.allSettled(
      locks.map(lock => 
        this.inventoryLockService.releaseRedSetLock(lock.productId, customerIdentifier)
      )
    );
  }

  /**
   * Check Red Set availability (useful for frontend to check before showing order form)
   */
  async checkRedSetAvailability(productId: number): Promise<{ available: boolean; expiresAt?: Date }> {
    const lockStatus = await this.inventoryLockService.isRedSetLocked(productId);
    return {
      available: !lockStatus.locked,
      expiresAt: lockStatus.expiresAt
    };
  }

  /**
   * Release Red Set lock manually (e.g., when customer cancels order)
   */
  async cancelRedSetReservation(productId: number, customerIdentifier: string): Promise<boolean> {
    return this.inventoryLockService.releaseRedSetLock(productId, customerIdentifier);
  }
}