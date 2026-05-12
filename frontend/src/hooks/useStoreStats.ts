import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { StoreStat } from '../types';

interface UseStoreStatsParams {
  limit?: number;
}

export const useStoreStats = ({ limit = 10 }: UseStoreStatsParams = {}) => {
  return useQuery<StoreStat[]>({
    queryKey: ['store-stats', limit],
    queryFn: () => apiClient.getStoreStats(limit),
    staleTime: 1000 * 60 * 15,
  });
};