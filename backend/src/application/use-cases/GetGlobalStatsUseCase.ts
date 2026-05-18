import { Injectable, Inject } from '@nestjs/common';
import { GlobalStatsEntity } from '../../core/domain/entities/GlobalStats.entity';
import { IStatsRepository } from '../../core/domain/ports/out/IStatsRepository';
import { GlobalStatsUseCase } from '../../core/domain/ports/in/IStatsUseCase';

@Injectable()
export class GetGlobalStatsUseCaseImpl extends GlobalStatsUseCase {
  constructor(
    @Inject(IStatsRepository)
    private readonly statsRepository: IStatsRepository,
  ) {
    super();
  }

  async execute(): Promise<GlobalStatsEntity> {
    return this.statsRepository.getGlobalStats();
  }
}