import { Controller, Post, Body } from '@nestjs/common';
import { CreateOrderUseCase } from '../../application/orders/create-order.use-case';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { CalculatorService } from '../../application/calculator/calculator.service';
import { IProductRepository } from '../../domain/products/product.repository.interface';

/**
 * Presentation Layer: Orders Controller
 * Handles HTTP requests for order operations
 */
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly calculatorService: CalculatorService,
    private readonly productRepository: IProductRepository,
  ) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    // Execute use case to create order
    const order = await this.createOrderUseCase.execute({
      items: dto.items,
      memberCardNumber: dto.memberCardNumber,
    });

    // Get products for calculation details
    const itemsWithProducts = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.productRepository.findById(item.productId);
        return {
          product: product!,
          quantity: item.quantity,
        };
      }),
    );

    // Recalculate for detailed response
    const calculation = this.calculatorService.calculate({
      items: itemsWithProducts,
      memberCardNumber: dto.memberCardNumber,
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
  }
}
