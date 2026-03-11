import { Order } from './order.entity';

export interface CreateOrderData {
  memberCardNumber?: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface IOrderRepository {
  create(data: CreateOrderData, calculationResult: any): Promise<Order>;
  findById(id: number): Promise<Order | null>;
  findAll(limit?: number): Promise<Order[]>;
}
