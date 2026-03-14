import { Order } from './order.entity';
import { CalculationResult } from '../../application/calculator/service/calculator.service';

export interface CreateOrderData {
  memberCardNumber?: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

export interface IOrderRepository {
  create(data: CreateOrderData, calculationResult: CalculationResult): Promise<Order>;
  findById(id: number): Promise<Order | null>;
  findAll(limit?: number): Promise<Order[]>;
}
