'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/services/api-client';

export const useProducts = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts(),
  });
