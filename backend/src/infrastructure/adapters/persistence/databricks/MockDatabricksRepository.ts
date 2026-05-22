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
   * Returns empty arrays for SQL queries since we don't parse them.
   */
  async executeQuery<T = Record<string, unknown>>(_sql: string): Promise<T[]> {
    // Return empty array — AnalyticsController will get empty results
    // which is safer than crashing
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