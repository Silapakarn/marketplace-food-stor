import { apiClient } from '@/shared/services/api-client';
import { CreateOrderRequest, OrderResponse } from '../types';

class OrderService {
  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    return apiClient.post<OrderResponse>('/api/orders', orderData);
  }
}

export const orderService = new OrderService();