/**
 * Infrastructure Layer - Order API
 * Handles external API communication for orders
 */
 

import axios from 'axios';
import { CreateOrderRequest, OrderResponse } from '../types/order';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderApi = {
  async create(data: CreateOrderRequest): Promise<OrderResponse> {
    const response = await apiClient.post<OrderResponse>('/orders', data);
    return response.data;
  },
};
