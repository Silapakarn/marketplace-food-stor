'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/services/api-client';
import type { CreateOrderRequest } from '@/shared/types';

export const useCreateOrder = () => {
  const { mutateAsync: createOrder, data: orderResponse = null, isPending: loading, error, reset } = useMutation({
    mutationFn: (orderData: CreateOrderRequest) => apiClient.createOrder(orderData),
  });

  return {
    createOrder,
    orderResponse,
    loading,
    error: error instanceof Error ? error.message : null,
    reset,
  };
};
