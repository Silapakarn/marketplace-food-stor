'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/services/api-client';

export const useRedSetAvailability = (productId: number | null) => {
  const { data: availability = null, isFetching, refetch } = useQuery({
    queryKey: ['redSetAvailability', productId],
    queryFn: () => apiClient.checkRedSetAvailability(productId!),
    enabled: !!productId,
  });

  return { availability, loading: isFetching, refetch };
};
