import { Injectable, Inject } from '@nestjs/common';
import { CategoryStatEntity } from '../../core/domain/entities/CategoryStat.entity';
import { IStatsRepository } from '../../core/domain/ports/out/IStatsRepository';
import { CategoryStatsUseCase } from '../../core/domain/ports/in/IStatsUseCase';

@Injectable()
export class GetCategoryStatsUseCaseImpl extends CategoryStatsUseCase {
  constructor(
    @Inject(IStatsRepository)
    private readonly statsRepository: IStatsRepository,
  ) {
    super();
  }

  async execute(limit?: number): Promise<CategoryStatEntity[]> {
    return this.statsRepository.getCategoryStats(limit);
  }
}