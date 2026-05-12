import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DBSQLClient, DBSQLSession } from '@databricks/sql';

export interface DatabricksConfig {
  host: string;
  path: string;
  token: string;
}

@Injectable()
export class DatabricksService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabricksService.name);
  private client: DBSQLClient | null = null;
  private session: DBSQLSession | null = null;

  constructor() {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const config: DatabricksConfig = {
        host: process.env.DATABRICKS_HOST || '',
        path: process.env.DATABRICKS_PATH || '',
        token: process.env.DATABRICKS_TOKEN || '',
      };

      if (!config.host || !config.path || !config.token) {
        throw new Error('Missing Databricks configuration. Check DATABRICKS_HOST, DATABRICKS_PATH, DATABRICKS_TOKEN');
      }

      this.client = new DBSQLClient();
      await this.client.connect({
        host: config.host,
        path: config.path,
        token: config.token,
      });
      // openSession returns IDBSQLSession, cast to DBSQLSession for compatibility
      this.session = (await this.client.openSession()) as unknown as DBSQLSession;

      this.logger.log('Connected to Databricks SQL Warehouse');
    } catch (error) {
      this.logger.error('Failed to connect to Databricks', error);
      throw error;
    }
  }

  private async disconnect(): Promise<void> {
    if (this.session) {
      try {
        await this.session.close();
        this.logger.log('Disconnected from Databricks SQL Warehouse');
      } catch (error) {
        this.logger.error('Error disconnecting from Databricks', error);
      }
      this.session = null;
    }
    if (this.client) {
      try {
        await this.client.close();
      } catch (error) {
        this.logger.error('Error closing Databricks client', error);
      }
      this.client = null;
    }
  }

  private async ensureConnection(): Promise<DBSQLSession> {
    if (!this.session) {
      await this.connect();
    }
    return this.session!;
  }

  async executeQuery<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    const session = await this.ensureConnection();
    
    try {
      const operation = await session.executeStatement(sql);
      const results = await operation.fetchAll();
      
      return results as T[];
    } catch (error) {
      this.logger.error(`Query execution failed: ${sql}`, error);
      throw error;
    }
  }

  async getGlobalStats(): Promise<{
    totalRevenue: number;
    totalVolume: number;
    promotionImpact: number;
    promotionPercentage: number;
  }> {
    const sql = `
      SELECT 
        SUM(ventes) as totalRevenue,
        COUNT(*) as totalVolume,
        SUM(CASE WHEN en_promotion = true THEN ventes ELSE 0 END) as promotionImpact,
        ROUND(
          (SUM(CASE WHEN en_promotion = true THEN ventes ELSE 0 END) * 100.0) / NULLIF(SUM(ventes), 0),
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

    return results[0] || {
      totalRevenue: 0,
      totalVolume: 0,
      promotionImpact: 0,
      promotionPercentage: 0,
    };
  }

  async getTemporalStats(year?: number, month?: number): Promise<Array<{
    annee: number;
    mois: number;
    jour_semaine: number;
    ventes: number;
  }>> {
    let sql = `
      SELECT 
        annee,
        mois,
        jour_semaine,
        SUM(ventes) as ventes
      FROM train_clean
    `;

    const conditions: string[] = [];
    if (year) conditions.push(`annee = ${year}`);
    if (month) conditions.push(`mois = ${month}`);

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' GROUP BY annee, mois, jour_semaine ORDER BY annee, mois, jour_semaine';

    return this.executeQuery(sql);
  }

  async getCategoryStats(limit: number = 10): Promise<Array<{
    categorie_groupe: string;
    totalSales: number;
    percentage: number;
  }>> {
    const sql = `
      SELECT 
        i.categorie_groupe,
        SUM(t.ventes) as totalSales,
        ROUND(
          (SUM(t.ventes) * 100.0) / 
          (SELECT SUM(ventes) FROM train_clean),
          2
        ) as percentage
      FROM train_clean t
      JOIN items_clean i ON t.item_id = i.item_id
      GROUP BY i.categorie_groupe
      ORDER BY totalSales DESC
      LIMIT ${limit}
    `;

    return this.executeQuery(sql);
  }

  async getStoreStats(limit: number = 10): Promise<Array<{
    type_magasin: string;
    ville: string;
    totalSales: number;
    storeCount: number;
  }>> {
    const sql = `
      SELECT 
        s.type_magasin,
        s.ville,
        SUM(t.ventes) as totalSales,
        COUNT(DISTINCT s.store_id) as storeCount
      FROM train_clean t
      JOIN stores_clean s ON t.store_id = s.store_id
      GROUP BY s.type_magasin, s.ville
      ORDER BY totalSales DESC
      LIMIT ${limit}
    `;

    return this.executeQuery(sql);
  }
}