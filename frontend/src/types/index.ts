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

export interface PredictRequest {
  magasin_index: number;
  famille_index: number;
  saison_index: number;
  ventes_veille: number;
  moyenne_ventes_7j: number;
  est_weekend?: number;
  est_jour_ferie?: number;
  indicateur_promotion: number;
  prix_petrole: number;
  nb_transactions: number;
  ventes_veille_produit: number;
  moyenne_7j_produit: number;
  est_perissable?: number;
}

export interface PredictResponse {
  status: string;
  prediction: number;
  model: string;
  source: string;
}
