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

  private readonly T: string; // train table
  private readonly I: string; // items table
  private readonly S: string; // stores table

  constructor() {
    const catalog = process.env.DATABRICKS_CATALOG || '';
    const db = process.env.DATABRICKS_SCHEMA || '';
    const prefix = catalog && db ? `\`${catalog}\`.\`${db}\`.` : '';

    this.T = `${prefix}\`${process.env.TABLE_TRAIN || 'train_clean'}\``;
    this.I = `${prefix}\`${process.env.TABLE_ITEMS || 'items_clean'}\``;
    this.S = `${prefix}\`${process.env.TABLE_STORES || 'stores_clean'}\``;

    this.logger.log(`Tables: train=${this.T}, items=${this.I}, stores=${this.S}`);
  }

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
      throw new DatabricksConnectionException('Missing Databricks configuration');
    }
    try {
      this.client = new DBSQLClient();
      await this.client.connect({ host, path, token });
      this.session = (await this.client.openSession()) as unknown as DBSQLSession;
      this.logger.log('Connected to Databricks SQL Warehouse');
    } catch (error) {
      throw new DatabricksConnectionException('Failed to connect', error instanceof Error ? error : undefined);
    }
  }

  private async disconnect(): Promise<void> {
    try { if (this.session) { await this.session.close(); } } catch { /* ignore */ }
    try { if (this.client) { await this.client.close(); } } catch { /* ignore */ }
    this.session = null;
    this.client = null;
  }

  private async ensureSession(): Promise<DBSQLSession> {
    if (!this.session) await this.connect();
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
        this.logger.warn(`Query attempt ${attempt}/${this.MAX_RETRIES} failed: ${lastError.message}`);
        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY_MS * attempt);
          this.session = null; this.client = null;
        }
      }
    }
    throw lastError || new Error('Query execution failed');
  }

  /** Discover available tables in the current catalog/schema */
  async discoverTables(): Promise<string[]> {
    try {
      const rows = await this.executeQuery<{ tableName: string }>(
        `SHOW TABLES`,
      );
      return rows.map(r => Object.values(r)[0] as string || '');
    } catch {
      return [];
    }
  }

  private n(v: unknown): number { const x = Number(v); return Number.isFinite(x) ? x : 0; }

  async getGlobalStats(): Promise<GlobalStatsEntity> {
    const r = await this.executeQuery<Record<string, unknown>>(`
      SELECT
        COALESCE(SUM(ventes),0) as totalRevenue,
        COUNT(*) as totalVolume,
        COALESCE(SUM(CASE WHEN en_promotion=true THEN ventes ELSE 0 END),0) as promotionImpact,
        ROUND(COALESCE(SUM(CASE WHEN en_promotion=true THEN ventes ELSE 0 END),0)*100.0/NULLIF(COALESCE(SUM(ventes),0),0),2) as promotionPercentage
      FROM ${this.T}
    `);
    return GlobalStatsEntity.create({
      totalRevenue: this.n(r[0]?.totalRevenue),
      totalVolume: this.n(r[0]?.totalVolume),
      promotionImpact: this.n(r[0]?.promotionImpact),
      promotionPercentage: this.n(r[0]?.promotionPercentage),
    });
  }

  async getTemporalStats(year?: number, month?: number): Promise<TemporalDataEntity[]> {
    const c: string[] = [];
    if (year != null) c.push(`annee=${Math.floor(year)}`);
    if (month != null) c.push(`mois=${Math.floor(month)}`);
    const w = c.length ? ` WHERE ${c.join(' AND ')}` : '';
    const r = await this.executeQuery<Record<string, unknown>>(`
      SELECT annee,mois,jour_semaine,COALESCE(SUM(ventes),0) as ventes
      FROM ${this.T} ${w}
      GROUP BY annee,mois,jour_semaine ORDER BY annee,mois,jour_semaine
    `);
    return r.map(row => TemporalDataEntity.fromDatabricks(row as any));
  }

  async getCategoryStats(limit?: number): Promise<CategoryStatEntity[]> {
    const l = this.safeLimit(limit);
    const r = await this.executeQuery<Record<string, unknown>>(`
      SELECT i.categorie_groupe,COALESCE(SUM(t.ventes),0) as totalSales,
        ROUND(COALESCE(SUM(t.ventes),0)*100.0/NULLIF((SELECT COALESCE(SUM(ventes),0) FROM ${this.T}),0),2) as percentage,
        COUNT(*) as transactionCount
      FROM ${this.T} t JOIN ${this.I} i ON t.item_id=i.item_id
      GROUP BY i.categorie_groupe ORDER BY totalSales DESC LIMIT ${l}
    `);
    return r.map(row => CategoryStatEntity.fromDatabricks(row as any));
  }

  async getStoreStats(limit?: number): Promise<StoreStatEntity[]> {
    const l = this.safeLimit(limit);
    const r = await this.executeQuery<Record<string, unknown>>(`
      SELECT s.type_magasin,s.ville,COALESCE(SUM(t.ventes),0) as totalSales,
        COUNT(DISTINCT s.store_id) as storeCount
      FROM ${this.T} t JOIN ${this.S} s ON t.store_id=s.store_id
      GROUP BY s.type_magasin,s.ville ORDER BY totalSales DESC LIMIT ${l}
    `);
    return r.map(row => StoreStatEntity.fromDatabricks(row as any));
  }

  async getCategoryStatsFiltered(filter: StatsFilter): Promise<CategoryStatEntity[]> {
    return this.getCategoryStats(filter.limit);
  }
  async getStoreStatsFiltered(filter: StatsFilter): Promise<StoreStatEntity[]> {
    return this.getStoreStats(filter.limit);
  }

  private safeLimit(l?: number): number {
    if (l == null) return 10;
    const s = Math.max(1, Math.min(1000, Math.floor(Number(l))));
    return Number.isFinite(s) ? s : 10;
  }
  private delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }
}