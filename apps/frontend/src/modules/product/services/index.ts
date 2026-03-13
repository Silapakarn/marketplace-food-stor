import { apiClient } from '@/shared/services/api-client';
import { Product, RedSetAvailability } from '../types';

class ProductService {
  async getProducts(): Promise<Product[]> {
    return apiClient.get<Product[]>('/api/products');
  }

  async checkRedSetAvailability(productId: number): Promise<RedSetAvailability> {
    return apiClient.get<RedSetAvailability>(`/api/orders/red-set/${productId}/availability`);
  }

}

export const productService = new ProductService();