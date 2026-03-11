import { Module } from '@nestjs/common';
import { OrdersController } from '../presentation/controllers/orders.controller';
import { CreateOrderUseCase } from '../application/orders/create-order.use-case';
import { CalculatorService } from '../application/calculator/calculator.service';
import { OrderRepository } from '../infrastructure/database/order.repository';
import { IOrderRepository } from '../domain/orders/order.repository.interface';
import { ProductsModule } from './products.module';

/**
 * Orders Module
 * Encapsulates all order-related functionality following DDD
 */
@Module({
  imports: [ProductsModule],
  controllers: [OrdersController],
  providers: [
    CreateOrderUseCase,
    CalculatorService,
    {
      provide: IOrderRepository,
      useClass: OrderRepository,
    },
  ],
})
export class OrdersModule {}
