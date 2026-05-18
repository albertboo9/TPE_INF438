import { GlobalStatsEntity } from '../../entities/GlobalStats.entity';
import { TemporalDataEntity } from '../../entities/TemporalData.entity';
import { CategoryStatEntity } from '../../entities/CategoryStat.entity';
import { StoreStatEntity } from '../../entities/StoreStat.entity';

export interface StatsFilter {
  year?: number;
  month?: number;
  limit?: number;
  categories?: string[];
  storeType?: string;
  city?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const IStatsRepository = Symbol('IStatsRepository');

export interface IStatsRepository {
  getGlobalStats(): Promise<GlobalStatsEntity>;
  getTemporalStats(year?: number, month?: number): Promise<TemporalDataEntity[]>;
  getCategoryStats(limit?: number): Promise<CategoryStatEntity[]>;
  getStoreStats(limit?: number): Promise<StoreStatEntity[]>;
  getCategoryStatsFiltered(filter: StatsFilter): Promise<CategoryStatEntity[]>;
  getStoreStatsFiltered(filter: StatsFilter): Promise<StoreStatEntity[]>;
}