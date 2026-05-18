import { Injectable, Inject } from '@nestjs/common';
import { TemporalDataEntity } from '../../core/domain/entities/TemporalData.entity';
import { IStatsRepository } from '../../core/domain/ports/out/IStatsRepository';
import { TemporalStatsUseCase } from '../../core/domain/ports/in/IStatsUseCase';

@Injectable()
export class GetTemporalStatsUseCaseImpl extends TemporalStatsUseCase {
  constructor(
    @Inject(IStatsRepository)
    private readonly statsRepository: IStatsRepository,
  ) {
    super();
  }

  async execute(year?: number, month?: number): Promise<TemporalDataEntity[]> {
    return this.statsRepository.getTemporalStats(year, month);
  }
}