import { Injectable, Logger } from '@nestjs/common';
import { DBSQLClient, DBSQLSession } from '@databricks/sql';
import { GlobalStatsEntity } from '../../../../core/domain/entities/GlobalStats.entity';
import { TemporalDataEntity } from '../../../../core/domain/entities/TemporalData.entity';
import { CategoryStatEntity } from '../../../../core/domain/entities/CategoryStat.entity';
import { StoreStatEntity } from '../../../../core/domain/entities/StoreStat.entity';
import { IStatsRepository, StatsFilter } from '../../../../core/domain/ports/out/IStatsRepository';
import { DatabricksConnectionException } from '../../../../core/exceptions/DatabricksConnectionException';

@Injectable()
export class DatabricksRepository implements IStatsRepository {
  private readonly logger = new Logger(DatabricksRepository.name);
  private client: DBSQLClient | null = null;
  private session: DBSQLSession | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    const host = process.env.DATABRICKS_HOST || '';
    const path = process.env.DATABRICKS_PATH || '';
    const token = process.env.DATABRICKS_TOKEN || '';

    if (!host || !path || !token) {
      throw new DatabricksConnectionException(
        'Missing Databricks configuration. Check DATABRICKS_HOST, DATABRICKS_PATH, DATABRICKS_TOKEN',
      );
    }

    try {
      this.client = new DBSQLClient();
      await this.client.connect({ host, path, token });
      this.session = (await this.client.openSession()) as unknown as DBSQLSession;
      this.logger.log('Connected to Databricks SQL Warehouse');
    } catch (error) {
      this.logger.error('Failed to connect to Databricks', error);
      throw new DatabricksConnectionException(
        'Failed to connect to Databricks SQL Warehouse',
        error instanceof Error ? error : undefined,
      );
    }
  }

  private async disconnect(): Promise<void> {
    if (this.session) {
      try {
        await this.session.close();
      } catch (error) {
        this.logger.error('Error closing session', error);
      }
      this.session = null;
    }
    if (this.client) {
      try {
        await this.client.close();
      } catch (error) {
        this.logger.error('Error closing client', error);
      }
      this.client = null;
    }
  }

  private async ensureSession(): Promise<DBSQLSession> {
    if (!this.session) {
      await this.connect();
    }
    return this.session!;
  }

  async executeQuery<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const session = await this.ensureSession();
        const operation = await session.executeStatement(sql);
        const results = await operation.fetchAll();
        await operation.close();
        return results as T[];
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Query attempt ${attempt}/${this.MAX_RETRIES} failed: ${lastError.message}`,
        );

        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY_MS * attempt);
          this.session = null;
          this.client = null;
        }
      }
    }

    throw lastError || new Error('Query execution failed after retries');
  }

  private sanitizeNumeric(value: unknown): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  async getGlobalStats(): Promise<GlobalStatsEntity> {
    const sql = `
      SELECT
        COALESCE(SUM(ventes), 0) as totalRevenue,
        COUNT(*) as totalVolume,
        COALESCE(SUM(CASE WHEN en_promotion = true THEN ventes ELSE 0 END), 0) as promotionImpact,
        ROUND(
          (COALESCE(SUM(CASE WHEN en_promotion = true THEN ventes ELSE 0 END), 0) * 100.0)
          / NULLIF(COALESCE(SUM(ventes), 0), 0),
          2
        ) as promotionPercentage
      FROM train_clean
    `;

    const results = await this.executeQuery<{
      totalRevenue: number;
      totalVolume: number;
      promotionImpact: number;
      promotionPercentage: number;
    }>(sql);

    const row = results[0];
    return GlobalStatsEntity.create({
      totalRevenue: this.sanitizeNumeric(row?.totalRevenue),
      totalVolume: this.sanitizeNumeric(row?.totalVolume),
      promotionImpact: this.sanitizeNumeric(row?.promotionImpact),
      promotionPercentage: this.sanitizeNumeric(row?.promotionPercentage),
      transactionCount: this.sanitizeNumeric(row?.totalVolume),
    });
  }

  async getTemporalStats(year?: number, month?: number): Promise<TemporalDataEntity[]> {
    // Sanitize parameters: only validated numbers get injected as SQL literals
    const conditions: string[] = [];
    if (year !== undefined && year !== null) {
      conditions.push(`annee = ${Math.floor(year)}`);
    }
    if (month !== undefined && month !== null) {
      conditions.push(`mois = ${Math.floor(month)}`);
    }
    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        annee,
        mois,
        jour_semaine,
        COALESCE(SUM(ventes), 0) as ventes
      FROM train_clean
      ${whereClause}
      GROUP BY annee, mois, jour_semaine
      ORDER BY annee, mois, jour_semaine
    `;

    const results = await this.executeQuery<{
      annee: number;
      mois: number;
      jour_semaine: number;
      ventes: number;
    }>(sql);

    return results.map((row) =>
      TemporalDataEntity.fromDatabricks(row),
    );
  }

  async getCategoryStats(limit?: number): Promise<CategoryStatEntity[]> {
    const safeLimit = this.sanitizeLimit(limit);

    const sql = `
      SELECT
        i.categorie_groupe,
        COALESCE(SUM(t.ventes), 0) as totalSales,
        ROUND(
          (COALESCE(SUM(t.ventes), 0) * 100.0) /
          NULLIF((SELECT COALESCE(SUM(ventes), 0) FROM train_clean), 0),
          2
        ) as percentage,
        COUNT(*) as transactionCount
      FROM train_clean t
      JOIN items_clean i ON t.item_id = i.item_id
      GROUP BY i.categorie_groupe
      ORDER BY totalSales DESC
      LIMIT ${safeLimit}
    `;

    const results = await this.executeQuery<{
      categorie_groupe: string;
      totalSales: number;
      percentage: number;
      transactionCount: number;
    }>(sql);

    return results.map((row) => CategoryStatEntity.fromDatabricks(row));
  }

  async getStoreStats(limit?: number): Promise<StoreStatEntity[]> {
    const safeLimit = this.sanitizeLimit(limit);

    const sql = `
      SELECT
        s.type_magasin,
        s.ville,
        COALESCE(SUM(t.ventes), 0) as totalSales,
        COUNT(DISTINCT s.store_id) as storeCount
      FROM train_clean t
      JOIN stores_clean s ON t.store_id = s.store_id
      GROUP BY s.type_magasin, s.ville
      ORDER BY totalSales DESC
      LIMIT ${safeLimit}
    `;

    const results = await this.executeQuery<{
      type_magasin: string;
      ville: string;
      totalSales: number;
      storeCount: number;
    }>(sql);

    return results.map((row) => StoreStatEntity.fromDatabricks(row));
  }

  async getCategoryStatsFiltered(filter: StatsFilter): Promise<CategoryStatEntity[]> {
    return this.getCategoryStats(filter.limit);
  }

  async getStoreStatsFiltered(filter: StatsFilter): Promise<StoreStatEntity[]> {
    return this.getStoreStats(filter.limit);
  }

  private sanitizeLimit(limit?: number): number {
    if (limit === undefined || limit === null) return 10;
    const sanitized = Math.max(1, Math.min(1000, Math.floor(Number(limit))));
    return Number.isFinite(sanitized) ? sanitized : 10;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}