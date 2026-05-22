import { useQuery } from '@tanstack/react-query';
import { apiClient, AnalyticsFilters } from '../services/api';

export const useSalesByDayOfWeek = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['sales-by-day', filters],
    queryFn: () => apiClient.salesByDayOfWeek(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSalesByMonth = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['sales-by-month', filters],
    queryFn: () => apiClient.salesByMonth(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSalesByYear = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['sales-by-year', filters],
    queryFn: () => apiClient.salesByYear(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const usePromotionImpact = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['promotion-impact', filters],
    queryFn: () => apiClient.promotionImpact(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTopProducts = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['top-products', filters],
    queryFn: () => apiClient.topProducts(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTopStores = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['top-stores', filters],
    queryFn: () => apiClient.topStores(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSalesTrend = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['sales-trend', filters],
    queryFn: () => apiClient.salesTrend(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategoryPerformance = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['category-performance', filters],
    queryFn: () => apiClient.categoryPerformance(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useStoreTypeComparison = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['store-type-comparison', filters],
    queryFn: () => apiClient.storeTypeComparison(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCityPerformance = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['city-performance', filters],
    queryFn: () => apiClient.cityPerformance(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useHolidayEffect = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['holiday-effect', filters],
    queryFn: () => apiClient.holidayEffect(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useInventoryInsights = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['inventory-insights', filters],
    queryFn: () => apiClient.inventoryInsights(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useSeasonalPatterns = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['seasonal-patterns', filters],
    queryFn: () => apiClient.seasonalPatterns(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useFullDashboard = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['full-dashboard', filters],
    queryFn: () => apiClient.fullDashboard(filters),
    staleTime: 1000 * 60 * 5,
  });
};
