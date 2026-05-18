import { GlobalStatsEntity } from '../../entities/GlobalStats.entity';
import { TemporalDataEntity } from '../../entities/TemporalData.entity';
import { CategoryStatEntity } from '../../entities/CategoryStat.entity';
import { StoreStatEntity } from '../../entities/StoreStat.entity';

export abstract class GlobalStatsUseCase {
  abstract execute(): Promise<GlobalStatsEntity>;
}

export abstract class TemporalStatsUseCase {
  abstract execute(year?: number, month?: number): Promise<TemporalDataEntity[]>;
}

export abstract class CategoryStatsUseCase {
  abstract execute(limit?: number): Promise<CategoryStatEntity[]>;
}

export abstract class StoreStatsUseCase {
  abstract execute(limit?: number): Promise<StoreStatEntity[]>;
}