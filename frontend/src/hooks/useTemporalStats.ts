import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { TemporalData } from '../types';

interface UseTemporalStatsParams {
  year?: number;
  month?: number;
}

export const useTemporalStats = ({ year, month }: UseTemporalStatsParams = {}) => {
  return useQuery<TemporalData[]>({
    queryKey: ['temporal-stats', year, month],
    queryFn: () => apiClient.getTemporalStats(year, month),
    staleTime: 1000 * 60 * 10,
  });
};