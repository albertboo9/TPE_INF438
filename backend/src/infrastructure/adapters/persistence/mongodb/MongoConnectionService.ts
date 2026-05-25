import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';

/**
 * Service that manages the MongoDB connection for the mock/fallback repository.
 * Connects lazily on first use and maintains a connection pool.
 */
@Injectable()
export class MongoConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoConnectionService.name);
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private _isConnected = false;

  private readonly uri: string;
  private readonly dbName: string;

  constructor() {
    this.uri = process.env.MONGO_URI || 'mongodb://admin:retail123@localhost:27017/';
    this.dbName = process.env.MONGO_DB_NAME || 'retail_mock';
  }

  async onModuleInit(): Promise<void> {
    // Don't auto-connect; wait for first query
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect(): Promise<void> {
    if (this._isConnected && this.client) return;

    try {
      this.logger.log(`🔌 Connecting to MongoDB at ${this.uri}...`);
      this.client = new MongoClient(this.uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this._isConnected = true;
      this.logger.log('✅ Connected to MongoDB successfully');
    } catch (err) {
      this._isConnected = false;
      this.logger.warn('⚠️ Could not connect to MongoDB. Fallback mode will not use Mongo.');
      this.logger.warn(`   Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
      } catch {
        // ignore
      }
      this.client = null;
      this.db = null;
      this._isConnected = false;
    }
  }

  private ensureConnected(): void {
    if (!this._isConnected || !this.db) {
      throw new Error('MongoDB not connected');
    }
  }

  getCollection(name: string): Collection {
    this.ensureConnected();
    return this.db!.collection(name);
  }

  async getGlobalTotalSales(): Promise<number> {
    this.ensureConnected();
    const result = await this.db!.collection('category_stats').aggregate([
      { $group: { _id: null, total: { $sum: '$total_sales' } } }
    ]).toArray();
    return result[0]?.total ?? 0;
  }

  async getTotalTransactions(): Promise<number> {
    this.ensureConnected();
    const result = await this.db!.collection('daily_sales').estimatedDocumentCount();
    return result;
  }
}