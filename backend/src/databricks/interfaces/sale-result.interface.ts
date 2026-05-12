export interface SaleResult {
  annee: number;
  mois: number;
  jour_semaine: number;
  en_promotion: boolean;
  ventes: number;
  store_id?: number;
  item_id?: number;
}