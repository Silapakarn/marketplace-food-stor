'use client';

import { useMutation } from '@tanstack/react-query';
import { orderService } from '../services';
import type { CreateOrderRequest, OrderResponse } from '../types';

export const useCreateOrder = () => {
  const mutation = useMutation({
    mutationFn: (orderData: CreateOrderRequest) => orderService.createOrder(orderData),
  });

  return {
    createOrder: mutation.mutateAsync,
    orderResponse: mutation.data,
    loading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
