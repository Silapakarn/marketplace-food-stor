import { API_ENDPOINTS } from '@/shared/constants';
import type { 
  ApiResponse, 
  Product, 
  CreateOrderRequest, 
  OrderResponse,
  RedSetAvailability 
} from '@/shared/types';

class ApiClient {
  private async request<T>(
    url: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: 'Network error occurred'
        }));
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Product APIs
  async getProducts(): Promise<Product[]> {
    const response = await this.request<Product[]>(API_ENDPOINTS.products);
    return response.data;
  }

  async getProductById(id: number): Promise<Product> {
    const response = await this.request<Product>(
      `${API_ENDPOINTS.products}/${id}`
    );
    return response.data;
  }

  // Order APIs
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    const response = await this.request<OrderResponse>(API_ENDPOINTS.orders, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Red Set Availability APIs
  async checkRedSetAvailability(productId: number): Promise<RedSetAvailability> {
    const response = await this.request<RedSetAvailability>(
      API_ENDPOINTS.redSetAvailability(productId)
    );
    return response.data;
  }

  async cancelRedSetReservation(productId: number): Promise<boolean> {
    const response = await this.request<{ released: boolean }>(
      API_ENDPOINTS.cancelRedSetReservation(productId),
      { method: 'DELETE' }
    );
    return response.data.released;
  }
}

export const apiClient = new ApiClient();