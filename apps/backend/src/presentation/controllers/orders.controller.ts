import { Controller, Post, Body, Get, Param, Query, Req, Delete } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderService } from '../../application/orders/service/order.service';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

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
  async checkRedSetAvailability(@Param('productId') productId: string) {
    const result = await this.orderService.checkRedSetAvailability(parseInt(productId));
    return {
      productId: parseInt(productId),
      available: result.available,
      expiresAt: result.expiresAt,
      message: result.available 
        ? 'Red Set is available for ordering'
        : `Red Set is currently reserved until ${result.expiresAt?.toISOString()}`
    };
  }

  @Delete('red-set/:productId/reservation')
  async cancelRedSetReservation(
    @Param('productId') productId: string,
    @Req() req: Request
  ) {
    const customerIdentifier = req.ip || req.socket.remoteAddress || 'unknown';
    const released = await this.orderService.cancelRedSetReservation(
      parseInt(productId), 
      customerIdentifier
    );
    
    return {
      productId: parseInt(productId),
      released,
      message: released 
        ? 'Red Set reservation cancelled successfully'
        : 'No active reservation found for this customer'
    };
  }
}
