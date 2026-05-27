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

// Nouveau modèle V2 - Features métier J+45
export interface PredictV2Request {
  numero_magasin: string;
  numero_produit: string;
  famille: string;
  saison?: string;
  est_perissable: number;
  est_weekend?: number;
  est_jour_ferie?: number;
  indicateur_promotion: number;
  prix_petrole?: number;
  ventes_veille_produit: number;
  moyenne_7j_produit: number;
}

export interface PredictV2Response {
  status: string;
  prediction: number;
  unite: string;
  model: string;
  model_type: string;
  source: string;
  date_prediction: string;
  saison: string;
  calendrier: {
    aujourdhui: string;
    jour_estime: string;
    saison_estimee: string;
    weekend: boolean;
    jour_ferie: boolean;
  };
  input: PredictV2Request;
  warning?: string;
}

export interface PredictCategoryRequest {
  numero_magasin: string;
  famille: string;
  saison?: string;
  indicateur_promotion: number;
  prix_petrole?: number;
  produits: Array<{
    numero_produit: string;
    ventes_veille_produit: number;
    moyenne_7j_produit: number;
    est_perissable: number;
  }>;
}

export interface PredictCategoryResponse {
  status: string;
  famille: string;
  numero_magasin: string;
  total_categorie: number;
  unite: string;
  produits: Array<{
    numero_produit: string;
    prediction: number;
    unite: string;
    source?: string;
  }>;
  nombre_produits: number;
  date_prediction: string;
}

export interface CalendarInfo {
  aujourdhui: string;
  jour_semaine: string;
  jplus45: string;
  jour_semaine_jplus45: string;
  saison_jplus45: string;
  est_weekend_jplus45: boolean;
  horizon_jours: number;
}

export interface OilPriceInfo {
  status: string;
  prix_petrole: number;
  unite: string;
  source: string;
}
