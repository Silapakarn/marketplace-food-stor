import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IOrderRepository, CreateOrderData } from '../../domain/orders/order.repository.interface';
import { Order } from '../../domain/orders/order.entity';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Infrastructure: Order Repository Implementation
 * Handles data persistence for Order aggregate
 */
@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderData, calculationResult: any): Promise<Order> {
    const order = await this.prisma.order.create({
      data: {
        memberCardNumber: data.memberCardNumber || null,
        totalBeforeDiscount: new Decimal(calculationResult.totalBeforeDiscount),
        pairDiscount: new Decimal(calculationResult.pairDiscount),
        memberDiscount: new Decimal(calculationResult.memberDiscount),
        finalTotal: new Decimal(calculationResult.finalTotal),
        orderItems: {
          create: await Promise.all(
            data.items.map(async (item) => {
              const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
              });
              
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
                subtotal: new Decimal(product.price.toNumber() * item.quantity),
              };
            }),
          ),
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

    // Track Red Set order if applicable
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

  private mapToOrderEntity(data: any): Order {
    return Order.create({
      id: data.id,
      memberCardNumber: data.memberCardNumber,
      totalBeforeDiscount: data.totalBeforeDiscount,
      pairDiscount: data.pairDiscount,
      memberDiscount: data.memberDiscount,
      finalTotal: data.finalTotal,
      createdAt: data.createdAt,
      items: data.orderItems.map((item: any) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        subtotal: item.subtotal.toNumber(),
      })),
    });
  }
}
