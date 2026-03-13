import type { ApiResponse } from '@/shared/types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  async call<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
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

      const result: ApiResponse<T> = await response.json();
      return result.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.call<T>(endpoint, { method: 'GET' });
  }


  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.call<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.call<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.call<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();