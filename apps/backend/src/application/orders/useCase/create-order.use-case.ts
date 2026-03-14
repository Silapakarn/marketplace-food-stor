import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/orders/order.repository.interface';
import { IProductRepository } from '../../../domain/products/product.repository.interface';
import { CalculatorService } from '../../calculator/service/calculator.service';
import { Order } from '../../../domain/orders/order.entity';
import { Product } from '../../../domain/products/product.entity';
import { roundToTwo } from '../../../shared/utils/format';
import Redis from 'ioredis';

export interface CreateOrderInput {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  memberCardNumber?: string;
  itemsWithProducts?: Array<{ product: Product; quantity: number }>;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('ORDER_REPOSITORY') private readonly orderRepository: IOrderRepository,
    @Inject('PRODUCT_REPOSITORY') private readonly productRepository: IProductRepository,
    private readonly calculatorService: CalculatorService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    const itemsWithProducts = input.itemsWithProducts ?? await this.fetchProducts(input.items);

    await this.validateRedSetRestriction(itemsWithProducts);

    const calculation = this.calculatorService.calculate({
      items: itemsWithProducts,
      memberCardNumber: input.memberCardNumber,
    });

    const order = await this.orderRepository.create(
      {
        memberCardNumber: input.memberCardNumber,
        items: itemsWithProducts.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.getPriceAsNumber(),
          subtotal: roundToTwo(item.product.getPriceAsNumber() * item.quantity),
        })),
      },
      calculation,
    );

    await this.trackRedSetOrder(itemsWithProducts);
    return order;
  }

  private async fetchProducts(
    items: Array<{ productId: number; quantity: number }>,
  ): Promise<Array<{ product: Product; quantity: number }>> {
    return Promise.all(
      items.map(async (item) => {
        if (item.quantity <= 0) {
          throw new BadRequestException('Quantity must be greater than 0');
        }
        const product = await this.productRepository.findById(item.productId);
        if (!product) {
          throw new BadRequestException(`Product with ID ${item.productId} not found`);
        }
        return { product, quantity: item.quantity };
      }),
    );
  }

  private async validateRedSetRestriction(
    items: Array<{ product: Product; quantity: number }>,
  ): Promise<void> {
    const hasRedSet = items.some((item) => item.product.isRedSet());

    if (hasRedSet) {
      const lastOrderTime = await this.redisClient.get('red_set:last_order');

      if (lastOrderTime) {
        const hoursDiff = (Date.now() - new Date(lastOrderTime).getTime()) / (1000 * 60 * 60);

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
    items: Array<{ product: Product; quantity: number }>,
  ): Promise<void> {
    const hasRedSet = items.some((item) => item.product.isRedSet());

    if (hasRedSet) {
      await this.redisClient.setex('red_set:last_order', 3600, new Date().toISOString());
    }
  }
}
