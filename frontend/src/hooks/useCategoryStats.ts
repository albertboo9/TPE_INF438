import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { CategoryStat } from '../types';

interface UseCategoryStatsParams {
  limit?: number;
}

export const useCategoryStats = ({ limit = 10 }: UseCategoryStatsParams = {}) => {
  return useQuery<CategoryStat[]>({
    queryKey: ['category-stats', limit],
    queryFn: () => apiClient.getCategoryStats(limit),
    staleTime: 1000 * 60 * 15,
  });
};