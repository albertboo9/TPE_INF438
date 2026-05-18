import { Injectable, Inject } from '@nestjs/common';
import { StoreStatEntity } from '../../core/domain/entities/StoreStat.entity';
import { IStatsRepository } from '../../core/domain/ports/out/IStatsRepository';
import { StoreStatsUseCase } from '../../core/domain/ports/in/IStatsUseCase';

@Injectable()
export class GetStoreStatsUseCaseImpl extends StoreStatsUseCase {
  constructor(
    @Inject(IStatsRepository)
    private readonly statsRepository: IStatsRepository,
  ) {
    super();
  }

  async execute(limit?: number): Promise<StoreStatEntity[]> {
    return this.statsRepository.getStoreStats(limit);
  }
}