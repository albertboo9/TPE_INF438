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

  async predictSales(data: {
    magasin_vec: number;
    saison_vec: number;
    ventes_veille: number;
    moyenne_ventes_7j: number;
    est_weekend: number;
    est_jour_ferie: number;
    indicateur_promotion: number;
    prix_petrole: number;
  }): Promise<{ status: string; prediction_transactions: number; source?: string }> {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Prediction API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();