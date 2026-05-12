export interface GlobalStats {
  totalRevenue: number;
  totalVolume: number;
  promotionImpact: number;
  promotionPercentage: number;
  transactionCount?: number;
}

export interface TemporalData {
  date: string;
  sales: number;
  dayOfWeek: number;
  month: number;
  year: number;
  enPromotion: boolean;
}

export interface CategoryStat {
  categorie_groupe: string;
  totalSales: number;
  percentage: number;
  transactionCount: number;
}

export interface StoreStat {
  type_magasin: string;
  ville: string;
  totalSales: number;
  storeCount: number;
  averageSalesPerStore: number;
}

export interface DateRange {
  from: Date;
  to?: Date;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}