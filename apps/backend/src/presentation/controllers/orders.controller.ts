import { Controller, Post, Body, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderService } from '../../application/orders/service/order.service';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: Request): Promise<OrderResponseDto> {
    const customerIdentifier = req.ip || req.socket.remoteAddress || 'unknown';
    return this.orderService.createOrder({
      items: dto.items,
      memberCardNumber: dto.memberCardNumber,
      customerIdentifier,
    });
  }

  @Get('red-set/:productId/availability')
  async checkRedSetAvailability(@Param('productId', ParseIntPipe) productId: number) {
    const result = await this.orderService.checkRedSetAvailability(productId);
    return {
      productId,
      available: result.available,
      expiresAt: result.expiresAt,
      message: result.available
        ? 'Red Set is available for ordering'
        : `Red Set is currently reserved until ${result.expiresAt?.toISOString()}`,
    };
  }
}
