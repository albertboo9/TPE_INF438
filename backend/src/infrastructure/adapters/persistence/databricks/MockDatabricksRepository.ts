import { Injectable, Logger } from '@nestjs/common';
import { GlobalStatsEntity } from '../../../../core/domain/entities/GlobalStats.entity';
import { TemporalDataEntity } from '../../../../core/domain/entities/TemporalData.entity';
import { CategoryStatEntity } from '../../../../core/domain/entities/CategoryStat.entity';
import { StoreStatEntity } from '../../../../core/domain/entities/StoreStat.entity';
import { IStatsRepository, StatsFilter } from '../../../../core/domain/ports/out/IStatsRepository';

/**
 * Mock repository that returns realistic static data.
 * Used as fallback when Databricks SQL Warehouse is unavailable.
 */
@Injectable()
export class MockDatabricksRepository implements IStatsRepository {
  private readonly logger = new Logger(MockDatabricksRepository.name);

  // Table reference properties for AnalyticsController compatibility
  public readonly T = 'mock_train';
  public readonly I = 'mock_items';
  public readonly S = 'mock_stores';

  constructor() {
    this.logger.warn('⚠️ MockDatabricksRepository initialized — returning static demo data');
  }

  /**
   * Mock executeQuery for AnalyticsController compatibility.
   * Intercepts common SQL patterns and returns realistic static data
   * so the frontend dashboards remain fully populated in fallback mode.
   */
  async executeQuery<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    const s = sql.toLowerCase();

    // ── 1. Sales Trend (both direct GROUP BY and CTE-wrapped versions)
    if (s.includes('group by annee, mois') || (s.includes('monthly_aggregated') && s.includes('annee'))) {
      const months: Array<{ year: number; month: number; total_sales: number; daily_avg: number; transaction_days: number }> = [
        { year: 2015, month: 1, total_sales: 1523456.50, daily_avg: 49143.76, transaction_days: 31 },
        { year: 2015, month: 2, total_sales: 1489012.30, daily_avg: 53179.01, transaction_days: 28 },
        { year: 2015, month: 3, total_sales: 1654321.80, daily_avg: 53365.22, transaction_days: 31 },
        { year: 2015, month: 4, total_sales: 1712345.20, daily_avg: 57078.17, transaction_days: 30 },
        { year: 2015, month: 5, total_sales: 1890123.40, daily_avg: 60971.72, transaction_days: 31 },
        { year: 2015, month: 6, total_sales: 1956789.10, daily_avg: 65226.30, transaction_days: 30 },
        { year: 2015, month: 7, total_sales: 2123456.70, daily_avg: 68498.60, transaction_days: 31 },
        { year: 2015, month: 8, total_sales: 2234567.30, daily_avg: 72082.82, transaction_days: 31 },
        { year: 2015, month: 9, total_sales: 1987654.20, daily_avg: 66255.14, transaction_days: 30 },
        { year: 2015, month: 10, total_sales: 1765432.10, daily_avg: 56949.42, transaction_days: 31 },
        { year: 2015, month: 11, total_sales: 1654321.80, daily_avg: 55144.06, transaction_days: 30 },
        { year: 2015, month: 12, total_sales: 2345678.90, daily_avg: 75667.06, transaction_days: 31 },
        { year: 2016, month: 1, total_sales: 2489012.30, daily_avg: 80290.72, transaction_days: 31 },
        { year: 2016, month: 2, total_sales: 2345678.90, daily_avg: 80885.48, transaction_days: 29 },
        { year: 2016, month: 3, total_sales: 2567890.10, daily_avg: 82835.16, transaction_days: 31 },
        { year: 2016, month: 4, total_sales: 2654321.80, daily_avg: 88477.39, transaction_days: 30 },
        { year: 2016, month: 5, total_sales: 2789012.30, daily_avg: 89968.14, transaction_days: 31 },
        { year: 2016, month: 6, total_sales: 2890123.40, daily_avg: 96337.45, transaction_days: 30 },
      ] as any;
      return months.map(d => ({
        annee: d.year,
        mois: d.month,
        total_sales: d.total_sales,
        sales: d.total_sales,
        daily_avg: d.daily_avg,
        transaction_days: d.transaction_days,
      })) as any;
    }

    // ── 2. Category Performance with share %
    if (s.includes('group by i.family') || (s.includes('categorie_groupe') && s.includes('share'))) {
      return [
        { categorie_groupe: 'GROCERY I',    total_sales: 82462500.00, share: 44.73, transactions: 8500000 },
        { categorie_groupe: 'BEVERAGES',    total_sales: 28450000.00, share: 15.44, transactions: 3200000 },
        { categorie_groupe: 'PRODUCE',      total_sales: 19340000.00, share: 10.49, transactions: 2100000 },
        { categorie_groupe: 'DAIRY',        total_sales: 16780000.00, share:  9.10, transactions: 1800000 },
        { categorie_groupe: 'BREAD/BAKERY', total_sales: 12450000.00, share:  6.76, transactions: 1400000 },
        { categorie_groupe: 'FROZEN FOODS', total_sales:  8900000.00, share:  4.83, transactions:  950000 },
        { categorie_groupe: 'MEATS',        total_sales:  7600000.00, share:  4.12, transactions:  820000 },
        { categorie_groupe: 'DELI',         total_sales:  5200000.00, share:  2.82, transactions:  580000 },
        { categorie_groupe: 'CLEANING',     total_sales:  2100000.00, share:  1.14, transactions:  250000 },
        { categorie_groupe: 'PERSONAL CARE',total_sales:  1500000.00, share:  0.81, transactions:  180000 },
      ] as any;
    }

    // ── 3. Store type comparison (no city grouping)
    if (s.includes('group by s.type') && !s.includes('s.city')) {
      return [
        { type_magasin: 'SUPERMARKET', total_sales: 50610000.00, sales: 50610000.00 },
        { type_magasin: 'GROCERY',     total_sales: 25900000.00, sales: 25900000.00 },
      ] as any;
    }

    // ── 4. Promotion Impact
    if (s.includes('onpromotion') && s.includes('en_promotion')) {
      return [
        { en_promotion: true,  total_sales: 42500000.00, avg_sale: 8.50, count: 5000000  },
        { en_promotion: false, total_sales: 141779362.50, avg_sale: 7.09, count: 20000000 },
      ] as any;
    }

    // ── 5. Top Products (by item_nbr)
    if (s.includes('group by t.item_nbr')) {
      return [
        { item_id: 1503844, item_nbr: 1503844, family: 'GROCERY I',    sales: 1287432, total_sales: 1287432 },
        { item_id: 1047679, item_nbr: 1047679, family: 'BEVERAGES',    sales:  982100, total_sales:  982100 },
        { item_id: 1958216, item_nbr: 1958216, family: 'PRODUCE',      sales:  854500, total_sales:  854500 },
        { item_id:  108952, item_nbr:  108952, family: 'DAIRY',        sales:  721300, total_sales:  721300 },
        { item_id: 1473474, item_nbr: 1473474, family: 'BREAD/BAKERY', sales:  653900, total_sales:  653900 },
      ] as any;
    }

    // ── 6. Top Stores / City performance (grouped by store or city)
    if (s.includes('group by s.store_nbr') || s.includes('group by s.city')) {
      return [
        { store_id: 1, ville: 'Quito',         type_magasin: 'SUPERMARKET', total_sales: 15250000.00, sales: 15250000.00, avg_sale: 8.12, stores: 1 },
        { store_id: 2, ville: 'Guayaquil',     type_magasin: 'SUPERMARKET', total_sales: 12450000.00, sales: 12450000.00, avg_sale: 7.89, stores: 1 },
        { store_id: 3, ville: 'Cuenca',        type_magasin: 'SUPERMARKET', total_sales:  8900000.00, sales:  8900000.00, avg_sale: 7.45, stores: 1 },
        { store_id: 4, ville: 'Quito',         type_magasin: 'GROCERY',     total_sales:  8900000.00, sales:  8900000.00, avg_sale: 6.78, stores: 1 },
        { store_id: 5, ville: 'Guayaquil',     type_magasin: 'GROCERY',     total_sales:  7600000.00, sales:  7600000.00, avg_sale: 6.54, stores: 1 },
        { store_id: 6, ville: 'Santo Domingo', type_magasin: 'SUPERMARKET', total_sales:  5200000.00, sales:  5200000.00, avg_sale: 7.21, stores: 1 },
        { store_id: 7, ville: 'Cuenca',        type_magasin: 'GROCERY',     total_sales:  4500000.00, sales:  4500000.00, avg_sale: 6.33, stores: 1 },
        { store_id: 8, ville: 'Machala',       type_magasin: 'SUPERMARKET', total_sales:  3800000.00, sales:  3800000.00, avg_sale: 7.01, stores: 1 },
        { store_id: 9, ville: 'Santo Domingo', type_magasin: 'GROCERY',     total_sales:  2800000.00, sales:  2800000.00, avg_sale: 6.12, stores: 1 },
        { store_id: 10,ville: 'Machala',       type_magasin: 'GROCERY',     total_sales:  2100000.00, sales:  2100000.00, avg_sale: 5.98, stores: 1 },
      ] as any;
    }

    // ── 7. Full dashboard quick category list (limit 10)
    if (s.includes('group by i.family') && s.includes('limit 10')) {
      return [
        { categorie_groupe: 'GROCERY I',    total_sales: 82462500.00, share: 44.73 },
        { categorie_groupe: 'BEVERAGES',    total_sales: 28450000.00, share: 15.44 },
        { categorie_groupe: 'PRODUCE',      total_sales: 19340000.00, share: 10.49 },
        { categorie_groupe: 'DAIRY',        total_sales: 16780000.00, share:  9.10 },
        { categorie_groupe: 'BREAD/BAKERY', total_sales: 12450000.00, share:  6.76 },
        { categorie_groupe: 'FROZEN FOODS', total_sales:  8900000.00, share:  4.83 },
        { categorie_groupe: 'MEATS',        total_sales:  7600000.00, share:  4.12 },
        { categorie_groupe: 'DELI',         total_sales:  5200000.00, share:  2.82 },
        { categorie_groupe: 'CLEANING',     total_sales:  2100000.00, share:  1.14 },
        { categorie_groupe: 'PERSONAL CARE',total_sales:  1500000.00, share:  0.81 },
      ] as any;
    }

    // Default — no pattern matched
    this.logger.debug(`executeQuery: no pattern matched for query: ${sql.slice(0, 120)}...`);
    return [] as T[];
  }

  async getGlobalStats(): Promise<GlobalStatsEntity> {
    return GlobalStatsEntity.create({
      totalRevenue: 184279362.50,
      totalVolume: 25000000,
      promotionImpact: 42500000.00,
      promotionPercentage: 23.06,
      transactionCount: 25000000,
    });
  }

  async getTemporalStats(year?: number, month?: number): Promise<TemporalDataEntity[]> {
    const data = [
      { annee: 2015, mois: 1, jour_semaine: 4, ventes: 1523456.50 },
      { annee: 2015, mois: 2, jour_semaine: 1, ventes: 1489012.30 },
      { annee: 2015, mois: 3, jour_semaine: 1, ventes: 1654321.80 },
      { annee: 2015, mois: 4, jour_semaine: 3, ventes: 1712345.20 },
      { annee: 2015, mois: 5, jour_semaine: 5, ventes: 1890123.40 },
      { annee: 2015, mois: 6, jour_semaine: 6, ventes: 1956789.10 },
      { annee: 2015, mois: 7, jour_semaine: 4, ventes: 2123456.70 },
      { annee: 2015, mois: 8, jour_semaine: 6, ventes: 2234567.30 },
      { annee: 2015, mois: 9, jour_semaine: 3, ventes: 1987654.20 },
      { annee: 2015, mois: 10, jour_semaine: 6, ventes: 1765432.10 },
      { annee: 2015, mois: 11, jour_semaine: 1, ventes: 1654321.80 },
      { annee: 2015, mois: 12, jour_semaine: 2, ventes: 2345678.90 },
      { annee: 2016, mois: 1, jour_semaine: 5, ventes: 2489012.30 },
      { annee: 2016, mois: 2, jour_semaine: 1, ventes: 2345678.90 },
      { annee: 2016, mois: 3, jour_semaine: 3, ventes: 2567890.10 },
      { annee: 2016, mois: 4, jour_semaine: 5, ventes: 2654321.80 },
      { annee: 2016, mois: 5, jour_semaine: 1, ventes: 2789012.30 },
      { annee: 2016, mois: 6, jour_semaine: 4, ventes: 2890123.40 },
    ]
      .filter(d => {
        if (year != null && d.annee !== year) return false;
        if (month != null && d.mois !== month) return false;
        return true;
      })
      .map(d => TemporalDataEntity.fromDatabricks(d));

    return data;
  }

  async getCategoryStats(limit?: number): Promise<CategoryStatEntity[]> {
    const all = [
      { categorie_groupe: 'GROCERY I', totalSales: 82462500.00, percentage: 44.73, transactionCount: 8500000 },
      { categorie_groupe: 'BEVERAGES', totalSales: 28450000.00, percentage: 15.44, transactionCount: 3200000 },
      { categorie_groupe: 'PRODUCE', totalSales: 19340000.00, percentage: 10.49, transactionCount: 2100000 },
      { categorie_groupe: 'DAIRY', totalSales: 16780000.00, percentage: 9.10, transactionCount: 1800000 },
      { categorie_groupe: 'BREAD/BAKERY', totalSales: 12450000.00, percentage: 6.76, transactionCount: 1400000 },
      { categorie_groupe: 'FROZEN FOODS', totalSales: 8900000.00, percentage: 4.83, transactionCount: 950000 },
      { categorie_groupe: 'MEATS', totalSales: 7600000.00, percentage: 4.12, transactionCount: 820000 },
      { categorie_groupe: 'DELI', totalSales: 5200000.00, percentage: 2.82, transactionCount: 580000 },
      { categorie_groupe: 'CLEANING', totalSales: 2100000.00, percentage: 1.14, transactionCount: 250000 },
      { categorie_groupe: 'PERSONAL CARE', totalSales: 1500000.00, percentage: 0.81, transactionCount: 180000 },
    ];
    const l = limit != null ? Math.max(1, Math.min(1000, Math.floor(Number(limit)))) : 10;
    return all.slice(0, l).map(d => CategoryStatEntity.fromDatabricks(d));
  }

  async getStoreStats(limit?: number): Promise<StoreStatEntity[]> {
    const all = [
      { type_magasin: 'SUPERMARKET', ville: 'Quito', totalSales: 15250000.00, storeCount: 5 },
      { type_magasin: 'GROCERY', ville: 'Quito', totalSales: 8900000.00, storeCount: 3 },
      { type_magasin: 'SUPERMARKET', ville: 'Guayaquil', totalSales: 12450000.00, storeCount: 4 },
      { type_magasin: 'GROCERY', ville: 'Guayaquil', totalSales: 7600000.00, storeCount: 3 },
      { type_magasin: 'SUPERMARKET', ville: 'Cuenca', totalSales: 8900000.00, storeCount: 3 },
      { type_magasin: 'GROCERY', ville: 'Cuenca', totalSales: 4500000.00, storeCount: 2 },
      { type_magasin: 'SUPERMARKET', ville: 'Santo Domingo', totalSales: 5200000.00, storeCount: 2 },
      { type_magasin: 'GROCERY', ville: 'Santo Domingo', totalSales: 2800000.00, storeCount: 1 },
      { type_magasin: 'SUPERMARKET', ville: 'Machala', totalSales: 3800000.00, storeCount: 2 },
      { type_magasin: 'GROCERY', ville: 'Machala', totalSales: 2100000.00, storeCount: 1 },
    ];
    const l = limit != null ? Math.max(1, Math.min(1000, Math.floor(Number(limit)))) : 10;
    return all.slice(0, l).map(d => StoreStatEntity.fromDatabricks(d));
  }

  async getCategoryStatsFiltered(filter: StatsFilter): Promise<CategoryStatEntity[]> {
    return this.getCategoryStats(filter.limit);
  }

  async getStoreStatsFiltered(filter: StatsFilter): Promise<StoreStatEntity[]> {
    return this.getStoreStats(filter.limit);
  }
}