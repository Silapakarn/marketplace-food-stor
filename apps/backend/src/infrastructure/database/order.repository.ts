import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IOrderRepository, CreateOrderData } from '../../domain/orders/order.repository.interface';
import { CalculationResult } from '../../application/calculator/service/calculator.service';
import { Order } from '../../domain/orders/order.entity';
import { Decimal } from '@prisma/client/runtime/library';

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { orderItems: { include: { product: true } } };
}>;


@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderData, calculationResult: CalculationResult): Promise<Order> {
    const order = await this.prisma.order.create({
      data: {
        memberCardNumber: data.memberCardNumber || null,
        totalBeforeDiscount: new Decimal(calculationResult.totalBeforeDiscount),
        pairDiscount: new Decimal(calculationResult.pairDiscount),
        memberDiscount: new Decimal(calculationResult.memberDiscount),
        finalTotal: new Decimal(calculationResult.finalTotal),
        orderItems: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
            subtotal: new Decimal(item.subtotal),
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    const hasRedSet = order.orderItems.some(
      (item) => item.product.color.toLowerCase() === 'red',
    );
    
    if (hasRedSet) {
      await this.prisma.redSetOrder.create({
        data: {
          orderId: order.id,
        },
      });
    }

    return this.mapToOrderEntity(order);
  }

  async findById(id: number): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return order ? this.mapToOrderEntity(order) : null;
  }

  async findAll(limit: number = 100): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return orders.map((order) => this.mapToOrderEntity(order));
  }

  private mapToOrderEntity(data: OrderWithItems): Order {
    return Order.create({
      id: data.id,
      memberCardNumber: data.memberCardNumber,
      totalBeforeDiscount: data.totalBeforeDiscount,
      pairDiscount: data.pairDiscount,
      memberDiscount: data.memberDiscount,
      finalTotal: data.finalTotal,
      createdAt: data.createdAt,
      items: data.orderItems.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        subtotal: item.subtotal.toNumber(),
      })),
    });
  }
}
