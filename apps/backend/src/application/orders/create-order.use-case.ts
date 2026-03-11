import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../domain/orders/order.repository.interface';
import { IProductRepository } from '../../domain/products/product.repository.interface';
import { CalculatorService } from '../calculator/calculator.service';
import { Order } from '../../domain/orders/order.entity';
import Redis from 'ioredis';

export interface CreateOrderInput {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  memberCardNumber?: string;
}

/**
 * Use Case: Create Order
 * Orchestrates order creation with business rules validation
 */
@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
    private readonly calculatorService: CalculatorService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    // Validate and fetch products
    const itemsWithProducts = await Promise.all(
      input.items.map(async (item) => {
        const product = await this.productRepository.findById(item.productId);
        if (!product) {
          throw new BadRequestException(`Product with ID ${item.productId} not found`);
        }
        if (item.quantity <= 0) {
          throw new BadRequestException('Quantity must be greater than 0');
        }
        return {
          product,
          quantity: item.quantity,
        };
      }),
    );

    // Check Red Set restriction (only one order per hour)
    await this.validateRedSetRestriction(itemsWithProducts);

    // Calculate order totals with discounts
    const calculation = this.calculatorService.calculate({
      items: itemsWithProducts,
      memberCardNumber: input.memberCardNumber,
    });

    // Create order in database
    const order = await this.orderRepository.create(
      {
        memberCardNumber: input.memberCardNumber,
        items: input.items,
      },
      calculation,
    );

    // Track Red Set order in Redis if applicable
    await this.trackRedSetOrder(itemsWithProducts, order.id);

    return order;
  }

  private async validateRedSetRestriction(
    items: Array<{ product: any; quantity: number }>,
  ): Promise<void> {
    const hasRedSet = items.some((item) => item.product.isRedSet());
    
    if (hasRedSet) {
      const redSetKey = 'red_set:last_order';
      const lastOrderTime = await this.redisClient.get(redSetKey);
      
      if (lastOrderTime) {
        const lastOrder = new Date(lastOrderTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastOrder.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 1) {
          const remainingMinutes = Math.ceil((1 - hoursDiff) * 60);
          throw new BadRequestException(
            `Red set can only be ordered once per hour. Please wait ${remainingMinutes} more minute(s).`,
          );
        }
      }
    }
  }

  private async trackRedSetOrder(
    items: Array<{ product: any; quantity: number }>,
    orderId: number,
  ): Promise<void> {
    const hasRedSet = items.some((item) => item.product.isRedSet());
    
    if (hasRedSet) {
      const redSetKey = 'red_set:last_order';
      const now = new Date().toISOString();
      await this.redisClient.setex(redSetKey, 3600, now); // 1 hour TTL
    }
  }
}
