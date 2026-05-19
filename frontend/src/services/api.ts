import { GlobalStats, TemporalData, CategoryStat, StoreStat } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AnalyticsFilters {
  store_nbr?: string;
  item_nbr?: string;
  family?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  months?: number;
  year?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

class ApiClient {
  private async fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('accessToken');
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Automatic logout or redirect to login on token expiry
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-logout'));
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorMsg = await response.text();
      try {
        const errorJSON = JSON.parse(errorMsg);
        throw new Error(errorJSON.message || `API Error: ${response.statusText}`);
      } catch {
        throw new Error(errorMsg || `API Error: ${response.statusText}`);
      }
    }

    return response.json();
  }

  // --- AUTHENTICATION ENDPOINTS ---
  async login(username: string, password: string): Promise<LoginResponse> {
    return this.fetcher<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: username, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<UserProfile> {
    return this.fetcher<UserProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // --- STATS ENDPOINTS (CORE DOMAIN) ---
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

  // --- ADVANCED BIG DATA ANALYTICS ENDPOINTS (WITH DYNAMIC FILTERS) ---
  private buildQueryString(filters?: AnalyticsFilters): string {
    if (!filters) return '';
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val.toString());
      }
    });
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  async salesByDayOfWeek(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/sales-by-day${this.buildQueryString(filters)}`);
  }

  async salesByMonth(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/sales-by-month${this.buildQueryString(filters)}`);
  }

  async salesByYear(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/sales-by-year${this.buildQueryString(filters)}`);
  }

  async promotionImpact(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/promotion-impact${this.buildQueryString(filters)}`);
  }

  async topProducts(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/top-products${this.buildQueryString(filters)}`);
  }

  async topStores(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/top-stores${this.buildQueryString(filters)}`);
  }

  async salesTrend(filters?: AnalyticsFilters): Promise<any> {
    return this.fetcher<any>(`/analytics/sales-trend${this.buildQueryString(filters)}`);
  }

  async categoryPerformance(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/category-performance${this.buildQueryString(filters)}`);
  }

  async storeTypeComparison(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/store-type-comparison${this.buildQueryString(filters)}`);
  }

  async cityPerformance(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/city-performance${this.buildQueryString(filters)}`);
  }

  async holidayEffect(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/holiday-effect${this.buildQueryString(filters)}`);
  }

  async inventoryInsights(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/inventory-insights${this.buildQueryString(filters)}`);
  }

  async seasonalPatterns(filters?: AnalyticsFilters): Promise<any[]> {
    return this.fetcher<any[]>(`/analytics/seasonal-patterns${this.buildQueryString(filters)}`);
  }

  async fullDashboard(filters?: AnalyticsFilters): Promise<any> {
    return this.fetcher<any>(`/analytics/full-dashboard${this.buildQueryString(filters)}`);
  }

  // --- PREDICTIVE ML ENDPOINT ---
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
    const token = localStorage.getItem('accessToken');
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Prediction API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();