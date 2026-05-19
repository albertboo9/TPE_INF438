import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { GlobalStatsUseCase, TemporalStatsUseCase, CategoryStatsUseCase, StoreStatsUseCase } from '../../core/domain/ports/in/IStatsUseCase';
import { DateRangeRequest } from '../../application/dto/request/DateRangeRequest';
import { CategoryFilterRequest } from '../../application/dto/request/CategoryFilterRequest';
import { ResponseInterceptor } from '../interceptors/ResponseInterceptor';
import { JwtAuthGuard } from '../../infrastructure/adapters/security/JwtAuthGuard';
import { IStatsRepository } from '../../core/domain/ports/out/IStatsRepository';

@Controller('stats')
@UseInterceptors(ResponseInterceptor)
export class StatsController {
  constructor(
    @Inject(GlobalStatsUseCase)
    private readonly globalStatsUseCase: GlobalStatsUseCase,
    @Inject(TemporalStatsUseCase)
    private readonly temporalStatsUseCase: TemporalStatsUseCase,
    @Inject(CategoryStatsUseCase)
    private readonly categoryStatsUseCase: CategoryStatsUseCase,
    @Inject(StoreStatsUseCase)
    private readonly storeStatsUseCase: StoreStatsUseCase,
    @Inject(IStatsRepository)
    private readonly databricksRepo: IStatsRepository & { discoverTables?(): Promise<string[]> },
  ) { }

  @Get('global')
  @UseGuards(JwtAuthGuard)
  async getGlobalStats() {
    return this.globalStatsUseCase.execute();
  }

  @Get('temporal')
  @UseGuards(JwtAuthGuard)
  async getTemporalStats(@Query() query: DateRangeRequest) {
    return this.temporalStatsUseCase.execute(query.year, query.month);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  async getCategoryStats(@Query() query: CategoryFilterRequest) {
    return this.categoryStatsUseCase.execute(query.limit);
  }

  @Get('stores')
  @UseGuards(JwtAuthGuard)
  async getStoreStats(@Query('limit') limit: number = 10) {
    return this.storeStatsUseCase.execute(limit);
  }

  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}