import { Module } from '@nestjs/common';
import { OrdersController } from '../presentation/controllers/orders.controller';
import { OrderService } from '../application/orders/service/order.service';
import { CreateOrderUseCase } from '../application/orders/useCase/create-order.use-case';
import { CalculatorService } from '../application/calculator/service/calculator.service';
import { InventoryLockService } from '../application/orders/service/inventory-lock.service';
import { OrderRepository } from '../infrastructure/database/order.repository';
import { ProductsModule } from './products.module';

@Module({
  imports: [ProductsModule],
  controllers: [OrdersController],
  providers: [
    OrderService,
    CreateOrderUseCase,
    CalculatorService,
    InventoryLockService,
    {
      provide: 'ORDER_REPOSITORY',
      useClass: OrderRepository,
    },
  ],
})
export class OrdersModule {}
