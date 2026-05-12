import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { GlobalStats } from '../types';

export const useGlobalStats = () => {
  return useQuery<GlobalStats>({
    queryKey: ['global-stats'],
    queryFn: () => apiClient.getGlobalStats(),
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 5,
  });
};