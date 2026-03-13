'use client';

import { useQuery } from '@tanstack/react-query';
import { productService } from '../services';

export const useRedSetAvailability = (productId: number | null) => {
  const query = useQuery({
    queryKey: ['redSetAvailability', productId],
    queryFn: () => productService.checkRedSetAvailability(productId!),
    enabled: !!productId,
  });

  return {
    availability: query.data,
    loading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};
