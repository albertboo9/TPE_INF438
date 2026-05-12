import { GlobalStats, TemporalData, CategoryStat, StoreStat } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private async fetcher<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getGlobalStats(): Promise<GlobalStats> {
    return this.fetcher<GlobalStats>('/stats/global');
  }

  async getTemporalStats(year?: number, month?: number): Promise<TemporalData[]> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.fetcher<TemporalData[]>(`/stats/temporal${queryString}`);
  }

  async getCategoryStats(limit: number = 10): Promise<CategoryStat[]> {
    return this.fetcher<CategoryStat[]>(`/stats/categories?limit=${limit}`);
  }

  async getStoreStats(limit: number = 10): Promise<StoreStat[]> {
    return this.fetcher<StoreStat[]>(`/stats/stores?limit=${limit}`);
  }
}

export const apiClient = new ApiClient();