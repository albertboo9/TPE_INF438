import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { IStatsRepository } from '../../core/domain/ports/out/IStatsRepository';
import { JwtAuthGuard } from '../../infrastructure/adapters/security/JwtAuthGuard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    @Inject(IStatsRepository)
    private readonly repo: IStatsRepository,
  ) {}

  @Get('sales-by-dayofweek')
  async salesByDayOfWeek() {
    const results = await (this.repo as any).executeQuery(`
      SELECT jour_semaine, ROUND(SUM(ventes), 2) as total_sales, COUNT(*) as transactions
      FROM train_clean
      GROUP BY jour_semaine ORDER BY jour_semaine
    `);
    return results;
  }

  @Get('sales-by-month')
  async salesByMonth(@Query('year') year?: number) {
    const filter = year ? `WHERE annee = ${Math.floor(year)}` : '';
    const results = await (this.repo as any).executeQuery(`
      SELECT annee, mois, ROUND(SUM(ventes), 2) as total_sales, COUNT(*) as transactions
      FROM train_clean ${filter}
      GROUP BY annee, mois ORDER BY annee, mois
    `);
    return results;
  }

  @Get('sales-by-year')
  async salesByYear() {
    const results = await (this.repo as any).executeQuery(`
      SELECT annee, ROUND(SUM(ventes), 2) as total_sales, COUNT(*) as transactions,
        ROUND(AVG(ventes), 2) as avg_sale
      FROM train_clean
      GROUP BY annee ORDER BY annee
    `);
    return results;
  }

  @Get('promotion-impact')
  async promotionImpact() {
    const results = await (this.repo as any).executeQuery(`
      SELECT en_promotion,
        ROUND(SUM(ventes), 2) as total_sales,
        COUNT(*) as transactions,
        ROUND(AVG(ventes), 2) as avg_sale,
        ROUND(STDDEV(ventes), 2) as std_sale
      FROM train_clean
      GROUP BY en_promotion
    `);
    return results;
  }

  @Get('top-products')
  async topProducts(@Query('limit') limit?: number) {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const results = await (this.repo as any).executeQuery(`
      SELECT item_id, ROUND(SUM(ventes), 2) as total_sales,
        COUNT(*) as frequency, ROUND(AVG(ventes), 2) as avg_sale
      FROM train_clean
      GROUP BY item_id
      ORDER BY total_sales DESC
      LIMIT ${safeLimit}
    `);
    return results;
  }

  @Get('top-stores')
  async topStores(@Query('limit') limit?: number) {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const results = await (this.repo as any).executeQuery(`
      SELECT s.store_id, s.type_magasin, s.ville,
        ROUND(SUM(t.ventes), 2) as total_sales,
        ROUND(AVG(t.ventes), 2) as avg_sale
      FROM train_clean t
      JOIN stores_clean s ON t.store_id = s.store_id
      GROUP BY s.store_id, s.type_magasin, s.ville
      ORDER BY total_sales DESC
      LIMIT ${safeLimit}
    `);
    return results;
  }

  @Get('sales-trend')
  async salesTrend(@Query('months') months?: number) {
    const safeMonths = Math.min(Math.max(Number(months) || 12, 1), 60);
    const results = await (this.repo as any).executeQuery(`
      SELECT annee, mois,
        ROUND(SUM(ventes), 2) as total_sales,
        ROUND(AVG(ventes), 2) as daily_avg,
        COUNT(*) as transaction_days
      FROM train_clean
      WHERE (annee * 12 + mois) >= ((SELECT MAX(annee) FROM train_clean) * 12 + (SELECT MAX(mois) FROM train_clean)) - ${safeMonths}
      GROUP BY annee, mois
      ORDER BY annee, mois
    `);
    return results;
  }

  @Get('category-performance')
  async categoryPerformance() {
    const results = await (this.repo as any).executeQuery(`
      SELECT i.categorie_groupe,
        ROUND(SUM(t.ventes), 2) as total_sales,
        COUNT(*) as transactions,
        ROUND(AVG(t.ventes), 2) as avg_transaction,
        ROUND(SUM(t.ventes) * 100.0 / NULLIF((SELECT SUM(ventes) FROM train_clean), 0), 2) as revenue_share
      FROM train_clean t
      JOIN items_clean i ON t.item_id = i.item_id
      GROUP BY i.categorie_groupe
      ORDER BY total_sales DESC
    `);
    return results;
  }

  @Get('store-type-comparison')
  async storeTypeComparison() {
    const results = await (this.repo as any).executeQuery(`
      SELECT s.type_magasin,
        COUNT(DISTINCT s.store_id) as store_count,
        ROUND(SUM(t.ventes), 2) as total_sales,
        ROUND(AVG(t.ventes), 2) as avg_sales_per_store,
        ROUND(SUM(t.ventes) / NULLIF(COUNT(DISTINCT s.store_id), 0), 2) as sales_per_location
      FROM train_clean t
      JOIN stores_clean s ON t.store_id = s.store_id
      GROUP BY s.type_magasin
      ORDER BY total_sales DESC
    `);
    return results;
  }

  @Get('city-performance')
  async cityPerformance() {
    const results = await (this.repo as any).executeQuery(`
      SELECT s.ville, s.type_magasin,
        COUNT(DISTINCT s.store_id) as stores,
        ROUND(SUM(t.ventes), 2) as total_sales,
        ROUND(AVG(t.ventes), 2) as avg_sale
      FROM train_clean t
      JOIN stores_clean s ON t.store_id = s.store_id
      GROUP BY s.ville, s.type_magasin
      ORDER BY total_sales DESC
    `);
    return results;
  }

  @Get('holiday-effect')
  async holidayEffect() {
    // Approximation: check sales pattern differences by day of week
    const results = await (this.repo as any).executeQuery(`
      SELECT jour_semaine,
        ROUND(AVG(CASE WHEN en_promotion = true THEN ventes ELSE NULL END), 2) as promo_avg,
        ROUND(AVG(CASE WHEN en_promotion = false THEN ventes ELSE NULL END), 2) as non_promo_avg,
        ROUND(AVG(ventes), 2) as overall_avg
      FROM train_clean
      GROUP BY jour_semaine
      ORDER BY jour_semaine
    `);
    return results;
  }

  @Get('inventory-insights')
  async inventoryInsights() {
    const results = await (this.repo as any).executeQuery(`
      SELECT i.categorie_groupe,
        ROUND(AVG(t.ventes), 2) as avg_daily_sales,
        ROUND(STDDEV(t.ventes), 2) as sales_volatility,
        ROUND(AVG(t.ventes) + 2 * STDDEV(t.ventes), 2) as safety_stock_level
      FROM train_clean t
      JOIN items_clean i ON t.item_id = i.item_id
      GROUP BY i.categorie_groupe
      ORDER BY sales_volatility DESC
    `);
    return results;
  }

  @Get('seasonal-patterns')
  async seasonalPatterns() {
    const results = await (this.repo as any).executeQuery(`
      SELECT mois,
        ROUND(AVG(ventes), 2) as avg_sales,
        ROUND(STDDEV(ventes), 2) as volatility,
        ROUND(AVG(CASE WHEN en_promotion = true THEN ventes ELSE NULL END), 2) as promo_performance
      FROM train_clean
      GROUP BY mois
      ORDER BY mois
    `);
    return results;
  }

  @Get('full-dashboard')
  async fullDashboard() {
    const [
      globalStats,
      categoryPerf,
      monthlyTrend,
      storeComparison,
      promoImpact,
      topProducts,
    ] = await Promise.all([
      this.repo.getGlobalStats().then(s => s.toJSON()),
      (this.repo as any).executeQuery(`
        SELECT i.categorie_groupe, ROUND(SUM(t.ventes), 2) as total_sales,
          ROUND(SUM(t.ventes) * 100.0 / (SELECT SUM(ventes) FROM train_clean), 2) as share
        FROM train_clean t JOIN items_clean i ON t.item_id = i.item_id
        GROUP BY i.categorie_groupe ORDER BY total_sales DESC LIMIT 10
      `),
      (this.repo as any).executeQuery(`
        SELECT annee, mois, ROUND(SUM(ventes), 2) as sales
        FROM train_clean GROUP BY annee, mois ORDER BY annee, mois LIMIT 24
      `),
      (this.repo as any).executeQuery(`
        SELECT s.type_magasin, ROUND(SUM(t.ventes), 2) as sales
        FROM train_clean t JOIN stores_clean s ON t.store_id = s.store_id
        GROUP BY s.type_magasin ORDER BY sales DESC
      `),
      (this.repo as any).executeQuery(`
        SELECT en_promotion, ROUND(SUM(ventes), 2) as total_sales, COUNT(*) as count
        FROM train_clean GROUP BY en_promotion
      `),
      (this.repo as any).executeQuery(`
        SELECT item_id, ROUND(SUM(ventes), 2) as sales
        FROM train_clean GROUP BY item_id ORDER BY sales DESC LIMIT 5
      `),
    ]);

    return {
      globalStats,
      categoryPerformance: categoryPerf,
      monthlyTrend,
      storeComparison,
      promotionImpact: promoImpact,
      topProducts,
      generatedAt: new Date().toISOString(),
    };
  }

  @Get('custom-query')
  async customQuery(@Query('sql') sql: string) {
    // Only allow SELECT queries for security
    const sanitized = sql.trim().toUpperCase();
    if (!sanitized.startsWith('SELECT') && !sanitized.startsWith('WITH')) {
      return { error: 'Only SELECT/WITH queries are allowed' };
    }
    // Limit query length
    if (sql.length > 2000) {
      return { error: 'Query too long (max 2000 chars)' };
    }
    try {
      const results = await (this.repo as any).executeQuery(sql);
      return { results, rowCount: results.length };
    } catch (error: any) {
      return { error: `Query failed: ${error.message}` };
    }
  }
}