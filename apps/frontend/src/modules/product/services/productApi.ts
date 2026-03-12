/**
 * Infrastructure Layer - Product API
 * Handles external API communication
 */
 

import axios from 'axios';
import { Product } from '../types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/v1/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productApi = {
  async getAll(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  },

  async getById(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },
};
