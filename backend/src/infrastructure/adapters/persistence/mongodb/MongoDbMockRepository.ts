import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GlobalStatsEntity } from '../../../../core/domain/entities/GlobalStats.entity';
import { TemporalDataEntity } from '../../../../core/domain/entities/TemporalData.entity';
import { CategoryStatEntity } from '../../../../core/domain/entities/CategoryStat.entity';
import { StoreStatEntity } from '../../../../core/domain/entities/StoreStat.entity';
import { IStatsRepository, StatsFilter } from '../../../../core/domain/ports/out/IStatsRepository';
import { MongoConnectionService } from './MongoConnectionService';

/**
 * MongoDB-backed mock repository.
 * Returns data pre-aggregated from the CSV files via the ingestion script.
 * Falls back gracefully if MongoDB is unavailable.
 */
@Injectable()
export class MongoDbMockRepository implements IStatsRepository, OnModuleInit {
  private readonly logger = new Logger(MongoDbMockRepository.name);
  private ready = false;

  // Static fallback data if MongoDB is unavailable
  private staticFallback: IStatsRepository | null = null;

  // Table reference properties for AnalyticsController compatibility
  public readonly T = 'mock_train';
  public readonly I = 'mock_items';
  public readonly S = 'mock_stores';

  constructor(private readonly mongo: MongoConnectionService) {}

  /**
   * Smart mock executeQuery for AnalyticsController compatibility.
   * Intercepts common SQL queries and returns pre-aggregated MongoDB data
   * to ensure the frontend dashboards remain fully populated in mock mode.
   */
  async executeQuery<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    if (!this.ready) return [] as T[];

    const s = sql.toLowerCase();

    // ── 1. Sales Trend (both direct GROUP BY and CTE-wrapped versions)
    //    Catches: useSalesTrend (WITH monthly_aggregated...) and full-dashboard monthly
    if (s.includes('group by annee, mois') || (s.includes('monthly_aggregated') && s.includes('annee'))) {
      const data = await this.mongo.getCollection('temporal_stats')
        .find({}).sort({ year: 1, month: 1 }).limit(48).toArray();
      return data.map(d => ({
        annee: d.year,
        mois:  d.month,
        sales:       d.total_sales,
        total_sales: d.total_sales,
        daily_avg:   d.avg_sales,
        transaction_days: d.record_count,
      })) as any;
    }

    // ── 2. Category Performance with share %
    if (s.includes('group by i.family') || (s.includes('categorie_groupe') && s.includes('share'))) {
      const data = await this.mongo.getCollection('category_stats')
        .find({}).sort({ total_sales: -1 }).limit(10).toArray();
      return data.map(d => ({
        categorie_groupe: d.family,
        total_sales:      d.total_sales,
        share:            d.percentage,
        transactions:     d.record_count,
      })) as any;
    }

    // ── 3. Store type comparison (no city grouping)
    if (s.includes('group by s.type') && !s.includes('s.city')) {
      const data = await this.mongo.getCollection('store_stats')
        .aggregate([{ $group: { _id: '$store_type', total_sales: { $sum: '$total_sales' }, count: { $sum: 1 } } }])
        .toArray();
      return data.map(d => ({ type_magasin: d._id || 'UNKNOWN', total_sales: d.total_sales, sales: d.total_sales })) as any;
    }

    // ── 4. Promotion Impact
    if (s.includes("onpromotion") && s.includes('en_promotion')) {
      // Get promo vs non-promo from category_stats which has promo_sales
      const cats = await this.mongo.getCollection('category_stats').find({}).toArray();
      const totalSales = cats.reduce((a: number, c: any) => a + (c.total_sales || 0), 0);
      const promoSales = cats.reduce((a: number, c: any) => a + (c.promo_sales  || 0), 0);
      return [
        { en_promotion: true,  total_sales: promoSales,            avg_sale: promoSales  / 5_000_000, count: 5_000_000  },
        { en_promotion: false, total_sales: totalSales - promoSales, avg_sale: (totalSales - promoSales) / 20_000_000, count: 20_000_000 },
      ] as any;
    }

    // ── 5. Top Products (by item_nbr)
    if (s.includes('group by t.item_nbr')) {
      return [
        { item_id: 1503844, item_nbr: 1503844, family: 'GROCERY I',    sales: 1_287_432, total_sales: 1_287_432 },
        { item_id: 1047679, item_nbr: 1047679, family: 'BEVERAGES',    sales:   982_100, total_sales:   982_100 },
        { item_id: 1958216, item_nbr: 1958216, family: 'PRODUCE',      sales:   854_500, total_sales:   854_500 },
        { item_id:  108952, item_nbr:  108952, family: 'DAIRY',        sales:   721_300, total_sales:   721_300 },
        { item_id: 1473474, item_nbr: 1473474, family: 'BREAD/BAKERY', sales:   653_900, total_sales:   653_900 },
      ] as any;
    }

    // ── 6. Top Stores / City performance (grouped by store or city)
    if (s.includes('group by s.store_nbr') || s.includes('group by s.city')) {
      const data = await this.mongo.getCollection('store_stats')
        .find({}).sort({ total_sales: -1 }).limit(10).toArray();
      return data.map(d => ({
        store_id:    d.store_nbr,
        ville:       d.city,
        type_magasin: d.store_type,
        total_sales: d.total_sales,
        sales:       d.total_sales,
        avg_sale:    d.avg_sales,
        stores:      1,
      })) as any;
    }

    // ── 7. Full dashboard quick category list (limit 10)
    if (s.includes('group by i.family') && s.includes('limit 10')) {
      const data = await this.mongo.getCollection('category_stats')
        .find({}).sort({ total_sales: -1 }).limit(10).toArray();
      return data.map(d => ({ categorie_groupe: d.family, total_sales: d.total_sales, share: d.percentage })) as any;
    }

    // Default — empty safe result
    this.logger.debug(`executeQuery: no pattern matched for query: ${sql.slice(0, 120)}...`);
    return [] as T[];
  }

  async onModuleInit(): Promise<void> {
    await this.mongo.connect();
    if (this.mongo.isConnected) {
      this.ready = true;
      this.logger.log('✅ MongoDbMockRepository ready');
    } else {
      this.logger.warn('⚠️ MongoDB unavailable — will use static fallback data');
      // Lazy import to avoid circular dependency
      const { MockDatabricksRepository } = await import(
        '../databricks/MockDatabricksRepository'
      );
      this.staticFallback = new MockDatabricksRepository();
    }
  }

  private ensureReady(): void {
    if (!this.ready) {
      throw new Error('MongoDB Mock Repository not ready');
    }
  }

  async getGlobalStats(): Promise<GlobalStatsEntity> {
    if (!this.ready) {
      return this.staticFallback!.getGlobalStats();
    }

    this.ensureReady();

    const categoryStats = await this.mongo.getCollection('category_stats')
      .find({})
      .project({ total_sales: 1, promo_sales: 1, _id: 0 })
      .toArray();

    const totalRevenue = categoryStats.reduce((sum: number, c: any) => sum + (c.total_sales ?? 0), 0);
    const totalPromoSales = categoryStats.reduce((sum: number, c: any) => sum + (c.promo_sales ?? 0), 0);
    const totalVolume = await this.mongo.getTotalTransactions();
    const promoPercentage = totalRevenue > 0 ? Math.round((totalPromoSales / totalRevenue) * 10000) / 100 : 0;

    return GlobalStatsEntity.create({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalVolume,
      promotionImpact: Math.round(totalPromoSales * 100) / 100,
      promotionPercentage: promoPercentage,
      transactionCount: totalVolume,
    });
  }

  async getTemporalStats(year?: number, month?: number): Promise<TemporalDataEntity[]> {
    if (!this.ready) {
      return this.staticFallback!.getTemporalStats(year, month);
    }

    this.ensureReady();

    const match: any = {};
    if (year != null) match.year = year;
    if (month != null) match.month = month;

    const data = await this.mongo.getCollection('temporal_stats')
      .find(match)
      .sort({ year: 1, month: 1 })
      .toArray();

    return data.map((d: any) =>
      TemporalDataEntity.fromDatabricks({
        annee: d.year,
        mois: d.month,
        jour_semaine: 1,
        ventes: d.total_sales,
      })
    );
  }

  async getCategoryStats(limit?: number): Promise<CategoryStatEntity[]> {
    if (!this.ready) {
      return this.staticFallback!.getCategoryStats(limit);
    }

    this.ensureReady();

    const l = limit != null ? Math.max(1, Math.min(100, Math.floor(Number(limit)))) : 50;
    const data = await this.mongo.getCollection('category_stats')
      .find({})
      .sort({ total_sales: -1 })
      .limit(l)
      .toArray();

    return data.map((d: any) =>
      CategoryStatEntity.fromDatabricks({
        categorie_groupe: d.family,
        totalSales: d.total_sales,
        percentage: d.percentage ?? 0,
        transactionCount: d.transaction_count,
      })
    );
  }

  async getStoreStats(limit?: number): Promise<StoreStatEntity[]> {
    if (!this.ready) {
      return this.staticFallback!.getStoreStats(limit);
    }

    this.ensureReady();

    const l = limit != null ? Math.max(1, Math.min(100, Math.floor(Number(limit)))) : 50;
    const data = await this.mongo.getCollection('store_stats')
      .find({})
      .sort({ total_sales: -1 })
      .limit(l)
      .toArray();

    return data.map((d: any) =>
      StoreStatEntity.fromDatabricks({
        type_magasin: d.store_type,
        ville: d.city ?? 'Unknown',
        totalSales: d.total_sales,
        storeCount: 1,
      })
    );
  }

  async getCategoryStatsFiltered(filter: StatsFilter): Promise<CategoryStatEntity[]> {
    if (!this.ready) {
      return this.staticFallback!.getCategoryStatsFiltered(filter);
    }

    this.ensureReady();

    const query: any = {};
    if (filter.categories && filter.categories.length > 0) {
      query.family = { $in: filter.categories };
    }

    const l = filter.limit != null ? Math.max(1, Math.min(100, Math.floor(Number(filter.limit)))) : 50;
    const data = await this.mongo.getCollection('category_stats')
      .find(query)
      .sort({ total_sales: -1 })
      .limit(l)
      .toArray();

    return data.map((d: any) =>
      CategoryStatEntity.fromDatabricks({
        categorie_groupe: d.family,
        totalSales: d.total_sales,
        percentage: d.percentage ?? 0,
        transactionCount: d.transaction_count,
      })
    );
  }

  async getStoreStatsFiltered(filter: StatsFilter): Promise<StoreStatEntity[]> {
    if (!this.ready) {
      return this.staticFallback!.getStoreStatsFiltered(filter);
    }

    this.ensureReady();

    const query: any = {};
    if (filter.storeType) query.store_type = filter.storeType;
    if (filter.city) query.city = filter.city;

    const l = filter.limit != null ? Math.max(1, Math.min(100, Math.floor(Number(filter.limit)))) : 50;
    const data = await this.mongo.getCollection('store_stats')
      .find(query)
      .sort({ total_sales: -1 })
      .limit(l)
      .toArray();

    return data.map((d: any) =>
      StoreStatEntity.fromDatabricks({
        type_magasin: d.store_type,
        ville: d.city ?? 'Unknown',
        totalSales: d.total_sales,
        storeCount: 1,
      })
    );
  }
}