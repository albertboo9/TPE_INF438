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

  /**
   * Helper to build dynamic WHERE clauses and JOINs based on director query filters.
   * Allows deep slicing of 80M rows by store, product, category, or date ranges.
   */
  private buildFilters(query: {
    store_nbr?: string;
    item_nbr?: string;
    family?: string;
    startDate?: string;
    endDate?: string;
  }, joins: { items?: boolean; stores?: boolean } = {}): { where: string; joinSql: string } {
    const clauses: string[] = [];
    let joinSql = '';

    if (query.store_nbr) {
      clauses.push(`t.store_nbr = '${query.store_nbr.replace(/'/g, "''")}'`);
    }
    if (query.item_nbr) {
      clauses.push(`t.item_nbr = '${query.item_nbr.replace(/'/g, "''")}'`);
    }
    if (query.family) {
      if (!joins.items) {
        const I = (this.repo as any).I;
        joinSql += ` JOIN ${I} i ON t.item_nbr = i.item_nbr`;
        joins.items = true;
      }
      clauses.push(`i.family = '${query.family.replace(/'/g, "''")}'`);
    }
    if (query.startDate) {
      clauses.push(`t.date >= '${query.startDate.replace(/'/g, "''")}'`);
    }
    if (query.endDate) {
      clauses.push(`t.date <= '${query.endDate.replace(/'/g, "''")}'`);
    }

    return {
      where: clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '',
      joinSql
    };
  }

  @Get('sales-by-dayofweek')
  async salesByDayOfWeek(@Query() query: any) {
    const T = (this.repo as any).T;
    const { where, joinSql } = this.buildFilters(query);
    const results = await (this.repo as any).executeQuery(`
      SELECT 
        DAYOFWEEK(TO_DATE(t.date, 'yyyy-MM-dd')) as jour_semaine, 
        ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales, 
        COUNT(*) as transactions
      FROM ${T} t
      ${joinSql}
      ${where}
      GROUP BY jour_semaine 
      ORDER BY jour_semaine
    `);
    return results;
  }

  @Get('sales-by-month')
  async salesByMonth(@Query() query: any) {
    const T = (this.repo as any).T;
    
    // Parse custom filter
    const clauses: string[] = [];
    if (query.year) {
      clauses.push(`YEAR(TO_DATE(t.date, 'yyyy-MM-dd')) = ${Math.floor(Number(query.year))}`);
    }
    if (query.store_nbr) {
      clauses.push(`t.store_nbr = '${query.store_nbr.replace(/'/g, "''")}'`);
    }
    if (query.item_nbr) {
      clauses.push(`t.item_nbr = '${query.item_nbr.replace(/'/g, "''")}'`);
    }
    if (query.startDate) {
      clauses.push(`t.date >= '${query.startDate.replace(/'/g, "''")}'`);
    }
    if (query.endDate) {
      clauses.push(`t.date <= '${query.endDate.replace(/'/g, "''")}'`);
    }
    
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
    const results = await (this.repo as any).executeQuery(`
      SELECT 
        YEAR(TO_DATE(t.date, 'yyyy-MM-dd')) as annee, 
        MONTH(TO_DATE(t.date, 'yyyy-MM-dd')) as mois, 
        ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales, 
        COUNT(*) as transactions
      FROM ${T} t ${where}
      GROUP BY annee, mois 
      ORDER BY annee, mois
    `);
    return results;
  }

  @Get('sales-by-year')
  async salesByYear(@Query() query: any) {
    const T = (this.repo as any).T;
    const { where, joinSql } = this.buildFilters(query);
    const results = await (this.repo as any).executeQuery(`
      SELECT 
        YEAR(TO_DATE(t.date, 'yyyy-MM-dd')) as annee, 
        ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales, 
        COUNT(*) as transactions,
        ROUND(AVG(CAST(t.unit_sales AS DOUBLE)), 2) as avg_sale
      FROM ${T} t
      ${joinSql}
      ${where}
      GROUP BY annee 
      ORDER BY annee
    `);
    return results;
  }

  @Get('promotion-impact')
  async promotionImpact(@Query() query: any) {
    const T = (this.repo as any).T;
    const { where, joinSql } = this.buildFilters(query);
    const results = await (this.repo as any).executeQuery(`
      SELECT 
        (t.onpromotion = 'True') as en_promotion,
        ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales,
        COUNT(*) as transactions,
        ROUND(AVG(CAST(t.unit_sales AS DOUBLE)), 2) as avg_sale,
        ROUND(STDDEV(CAST(t.unit_sales AS DOUBLE)), 2) as std_sale
      FROM ${T} t
      ${joinSql}
      ${where}
      GROUP BY en_promotion
    `);
    return results;
  }

  @Get('top-products')
  async topProducts(@Query() query: any) {
    const T = (this.repo as any).T;
    const safeLimit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const { where, joinSql } = this.buildFilters(query);
    
    const results = await (this.repo as any).executeQuery(`
      SELECT 
        t.item_nbr as item_id, 
        ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales,
        COUNT(*) as frequency, 
        ROUND(AVG(CAST(t.unit_sales AS DOUBLE)), 2) as avg_sale
      FROM ${T} t
      ${joinSql}
      ${where}
      GROUP BY t.item_nbr
      ORDER BY total_sales DESC
      LIMIT ${safeLimit}
    `);
    return results;
  }

  @Get('top-stores')
  async topStores(@Query() query: any) {
    const T = (this.repo as any).T;
    const S = (this.repo as any).S;
    const safeLimit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    
    // Custom filter builder to handle joined structures
    const clauses: string[] = [];
    if (query.item_nbr) clauses.push(`t.item_nbr = '${query.item_nbr.replace(/'/g, "''")}'`);
    if (query.store_nbr) clauses.push(`s.store_nbr = '${query.store_nbr.replace(/'/g, "''")}'`);
    if (query.startDate) clauses.push(`t.date >= '${query.startDate.replace(/'/g, "''")}'`);
    if (query.endDate) clauses.push(`t.date <= '${query.endDate.replace(/'/g, "''")}'`);
    
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';

    const results = await (this.repo as any).executeQuery(`
      SELECT 
        s.store_nbr as store_id, 
        s.type as type_magasin, 
        s.city as ville,
        ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales,
        ROUND(AVG(CAST(t.unit_sales AS DOUBLE)), 2) as avg_sale
      FROM ${T} t
      JOIN ${S} s ON t.store_nbr = s.store_nbr
      ${where}
      GROUP BY s.store_nbr, s.type, s.city
      ORDER BY total_sales DESC
      LIMIT ${safeLimit}
    `);
    return results;
  }

  @Get('sales-trend')
  async salesTrend(@Query() query: any) {
    const T = (this.repo as any).T;
    const safeMonths = Math.min(Math.max(Number(query.months) || 12, 1), 60);
    
    const clauses: string[] = [];
    if (query.store_nbr) clauses.push(`t.store_nbr = '${query.store_nbr.replace(/'/g, "''")}'`);
    if (query.item_nbr) clauses.push(`t.item_nbr = '${query.item_nbr.replace(/'/g, "''")}'`);
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';

    const results = await (this.repo as any).executeQuery(`
      WITH monthly_aggregated AS (
        SELECT 
          YEAR(TO_DATE(t.date, 'yyyy-MM-dd')) as annee, 
          MONTH(TO_DATE(t.date, 'yyyy-MM-dd')) as mois,
          ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales,
          ROUND(AVG(CAST(t.unit_sales AS DOUBLE)), 2) as daily_avg,
          COUNT(*) as transaction_days
        FROM ${T} t
        ${where}
        GROUP BY annee, mois
      )
      SELECT * FROM monthly_aggregated
      WHERE (annee * 12 + mois) >= ((SELECT MAX(annee) FROM monthly_aggregated) * 12 + (SELECT MAX(mois) FROM monthly_aggregated)) - ${safeMonths}
      ORDER BY annee, mois
    `);
    return results;
  }

  @Get('category-performance')
  async categoryPerformance(@Query() query: any) {
    const T = (this.repo as any).T;
    const I = (this.repo as any).I;
    
    const clauses: string[] = [];
    if (query.store_nbr) clauses.push(`t.store_nbr = '${query.store_nbr.replace(/'/g, "''")}'`);
    if (query.startDate) clauses.push(`t.date >= '${query.startDate.replace(/'/g, "''")}'`);
    if (query.endDate) clauses.push(`t.date <= '${query.endDate.replace(/'/g, "''")}'`);
    
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';

    const results = await (this.repo as any).executeQuery(`
      SELECT 
        i.family as categorie_groupe,
        ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales,
        COUNT(*) as transactions,
        ROUND(AVG(CAST(t.unit_sales AS DOUBLE)), 2) as avg_transaction,
        ROUND(SUM(CAST(t.unit_sales AS DOUBLE)) * 100.0 / NULLIF((SELECT SUM(CAST(unit_sales AS DOUBLE)) FROM ${T} t ${where}), 0), 2) as revenue_share
      FROM ${T} t
      JOIN ${I} i ON t.item_nbr = i.item_nbr
      ${where}
      GROUP BY i.family
      ORDER BY total_sales DESC
    `);
    return results;
  }

  @Get('store-type-comparison')
  async storeTypeComparison(@Query() query: any) {
    const T = (this.repo as any).T;
    const S = (this.repo as any).S;
    
    const clauses: string[] = [];
    if (query.item_nbr) clauses.push(`t.item_nbr = '${query.item_nbr.replace(/'/g, "''")}'`);
    if (query.startDate) clauses.push(`t.date >= '${query.startDate.replace(/'/g, "''")}'`);
    if (query.endDate) clauses.push(`t.date <= '${query.endDate.replace(/'/g, "''")}'`);
    
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';

    const results = await (this.repo as any).executeQuery(`
      SELECT 
        s.type as type_magasin,
        COUNT(DISTINCT s.store_nbr) as store_count,
        ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales,
        ROUND(AVG(CAST(t.unit_sales AS DOUBLE)), 2) as avg_sales_per_store,
        ROUND(SUM(CAST(t.unit_sales AS DOUBLE)) / NULLIF(COUNT(DISTINCT s.store_nbr), 0), 2) as sales_per_location
      FROM ${T} t
      JOIN ${S} s ON t.store_nbr = s.store_nbr
      ${where}
      GROUP BY s.type
      ORDER BY total_sales DESC
    `);
    return results;
  }

  @Get('city-performance')
  async cityPerformance(@Query() query: any) {
    const T = (this.repo as any).T;
    const S = (this.repo as any).S;
    
    const clauses: string[] = [];
    if (query.item_nbr) clauses.push(`t.item_nbr = '${query.item_nbr.replace(/'/g, "''")}'`);
    if (query.startDate) clauses.push(`t.date >= '${query.startDate.replace(/'/g, "''")}'`);
    if (query.endDate) clauses.push(`t.date <= '${query.endDate.replace(/'/g, "''")}'`);
    
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';

    const results = await (this.repo as any).executeQuery(`
      SELECT 
        s.city as ville, 
        s.type as type_magasin,
        COUNT(DISTINCT s.store_nbr) as stores,
        ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales,
        ROUND(AVG(CAST(t.unit_sales AS DOUBLE)), 2) as avg_sale
      FROM ${T} t
      JOIN ${S} s ON t.store_nbr = s.store_nbr
      ${where}
      GROUP BY s.city, s.type
      ORDER BY total_sales DESC
    `);
    return results;
  }

  @Get('holiday-effect')
  async holidayEffect(@Query() query: any) {
    const T = (this.repo as any).T;
    const { where, joinSql } = this.buildFilters(query);
    const results = await (this.repo as any).executeQuery(`
      SELECT 
        DAYOFWEEK(TO_DATE(t.date, 'yyyy-MM-dd')) as jour_semaine,
        ROUND(AVG(CASE WHEN t.onpromotion = 'True' THEN CAST(t.unit_sales AS DOUBLE) ELSE NULL END), 2) as promo_avg,
        ROUND(AVG(CASE WHEN t.onpromotion = 'False' THEN CAST(t.unit_sales AS DOUBLE) ELSE NULL END), 2) as non_promo_avg,
        ROUND(AVG(CAST(t.unit_sales AS DOUBLE)), 2) as overall_avg
      FROM ${T} t
      ${joinSql}
      ${where}
      GROUP BY jour_semaine
      ORDER BY jour_semaine
    `);
    return results;
  }

  @Get('inventory-insights')
  async inventoryInsights(@Query() query: any) {
    const T = (this.repo as any).T;
    const I = (this.repo as any).I;
    
    const clauses: string[] = [];
    if (query.store_nbr) clauses.push(`t.store_nbr = '${query.store_nbr.replace(/'/g, "''")}'`);
    if (query.startDate) clauses.push(`t.date >= '${query.startDate.replace(/'/g, "''")}'`);
    if (query.endDate) clauses.push(`t.date <= '${query.endDate.replace(/'/g, "''")}'`);
    
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';

    const results = await (this.repo as any).executeQuery(`
      SELECT 
        i.family as categorie_groupe,
        ROUND(AVG(CAST(t.unit_sales AS DOUBLE)), 2) as avg_daily_sales,
        ROUND(STDDEV(CAST(t.unit_sales AS DOUBLE)), 2) as sales_volatility,
        ROUND(AVG(CAST(t.unit_sales AS DOUBLE)) + 2 * STDDEV(CAST(t.unit_sales AS DOUBLE)), 2) as safety_stock_level
      FROM ${T} t
      JOIN ${I} i ON t.item_nbr = i.item_nbr
      ${where}
      GROUP BY i.family
      ORDER BY sales_volatility DESC
    `);
    return results;
  }

  @Get('seasonal-patterns')
  async seasonalPatterns(@Query() query: any) {
    const T = (this.repo as any).T;
    const { where, joinSql } = this.buildFilters(query);
    const results = await (this.repo as any).executeQuery(`
      SELECT 
        MONTH(TO_DATE(t.date, 'yyyy-MM-dd')) as mois,
        ROUND(AVG(CAST(t.unit_sales AS DOUBLE)), 2) as avg_sales,
        ROUND(STDDEV(CAST(t.unit_sales AS DOUBLE)), 2) as volatility,
        ROUND(AVG(CASE WHEN t.onpromotion = 'True' THEN CAST(t.unit_sales AS DOUBLE) ELSE NULL END), 2) as promo_performance
      FROM ${T} t
      ${joinSql}
      ${where}
      GROUP BY mois
      ORDER BY mois
    `);
    return results;
  }

  @Get('full-dashboard')
  async fullDashboard(@Query() query: any) {
    const T = (this.repo as any).T;
    const I = (this.repo as any).I;
    const S = (this.repo as any).S;
    
    const clauses: string[] = [];
    if (query.store_nbr) clauses.push(`t.store_nbr = '${query.store_nbr.replace(/'/g, "''")}'`);
    if (query.startDate) clauses.push(`t.date >= '${query.startDate.replace(/'/g, "''")}'`);
    if (query.endDate) clauses.push(`t.date <= '${query.endDate.replace(/'/g, "''")}'`);
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';

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
        SELECT 
          i.family as categorie_groupe, 
          ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales,
          ROUND(SUM(CAST(t.unit_sales AS DOUBLE)) * 100.0 / (SELECT SUM(CAST(unit_sales AS DOUBLE)) FROM ${T} t ${where}), 2) as share
        FROM ${T} t JOIN ${I} i ON t.item_nbr = i.item_nbr
        ${where}
        GROUP BY i.family ORDER BY total_sales DESC LIMIT 10
      `),
      (this.repo as any).executeQuery(`
        SELECT 
          YEAR(TO_DATE(t.date, 'yyyy-MM-dd')) as annee, 
          MONTH(TO_DATE(t.date, 'yyyy-MM-dd')) as mois, 
          ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as sales
        FROM ${T} t
        ${where}
        GROUP BY annee, mois 
        ORDER BY annee, mois LIMIT 24
      `),
      (this.repo as any).executeQuery(`
        SELECT 
          s.type as type_magasin, 
          ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as sales
        FROM ${T} t JOIN ${S} s ON t.store_nbr = s.store_nbr
        ${where}
        GROUP BY s.type ORDER BY sales DESC
      `),
      (this.repo as any).executeQuery(`
        SELECT 
          (t.onpromotion = 'True') as en_promotion, 
          ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as total_sales, 
          COUNT(*) as count
        FROM ${T} t
        ${where}
        GROUP BY en_promotion
      `),
      (this.repo as any).executeQuery(`
        SELECT 
          t.item_nbr as item_id, 
          ROUND(SUM(CAST(t.unit_sales AS DOUBLE)), 2) as sales
        FROM ${T} t
        ${where}
        GROUP BY t.item_nbr ORDER BY sales DESC LIMIT 5
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
    const sanitized = sql.trim().toUpperCase();
    if (!sanitized.startsWith('SELECT') && !sanitized.startsWith('WITH')) {
      return { error: 'Only SELECT/WITH queries are allowed' };
    }
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