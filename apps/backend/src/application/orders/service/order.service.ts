import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { CreateOrderUseCase } from '../useCase/create-order.use-case';
import { CalculatorService } from '../../calculator/service/calculator.service';
import { IProductRepository } from '../../../domain/products/product.repository.interface';
import { Product } from '../../../domain/products/product.entity';
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
    const redSetLocks: { productId: number }[] = [];

    try {
      const products = await Promise.all(
        input.items.map(item => this.productRepository.findById(item.productId))
      );

      const itemsWithProducts: Array<{ product: Product; quantity: number }> = [];
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (!product) {
          throw new ConflictException(`Product with ID ${input.items[i].productId} not found`);
        }
        itemsWithProducts.push({ product, quantity: input.items[i].quantity });
      }

      const redSetItems = itemsWithProducts.filter(item => item.product.isRedSet());

      if (redSetItems.length > 0) {
        const lockResults = await Promise.all(
          redSetItems.map(item =>
            this.inventoryLockService.acquireRedSetLock(item.product.id, input.customerIdentifier)
          )
        );

        for (let i = 0; i < lockResults.length; i++) {
          const lockResult = lockResults[i];
          if (!lockResult.success) {
            await this.releaseRedSetLocks(redSetLocks, input.customerIdentifier);
            throw new ConflictException(lockResult.message || 'Red Set is currently unavailable');
          }
          redSetLocks.push({ productId: redSetItems[i].product.id });
        }
      }

      const order = await this.createOrderUseCase.execute({
        items: input.items,
        memberCardNumber: input.memberCardNumber,
        itemsWithProducts,
      });

      const calculation = this.calculatorService.calculate({
        items: itemsWithProducts,
        memberCardNumber: input.memberCardNumber,
      });

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

  async checkRedSetAvailability(productId: number): Promise<{ available: boolean; expiresAt?: Date }> {
    const lockStatus = await this.inventoryLockService.isRedSetLocked(productId);
    return {
      available: !lockStatus.locked,
      expiresAt: lockStatus.expiresAt,
    };
  }

  private async releaseRedSetLocks(
    locks: { productId: number }[],
    customerIdentifier: string,
  ): Promise<void> {
    if (locks.length === 0) return;
    await Promise.allSettled(
      locks.map(lock => this.inventoryLockService.releaseRedSetLock(lock.productId, customerIdentifier))
    );
  }
}
