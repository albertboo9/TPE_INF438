import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/common';
import { DatabricksService } from './databricks.service';
import { DateRangeDto } from './dto/date-range.dto';
import { CategoryFilterDto } from './dto/category-filter.dto';

@Controller('stats')
@UseInterceptors(CacheInterceptor)
export class DatabricksController {
  constructor(private readonly databricksService: DatabricksService) {}

  @Get('global')
  @CacheTTL(900)
  async getGlobalStats() {
    return await this.databricksService.getGlobalStats();
  }

  @Get('temporal')
  @CacheTTL(600)
  async getTemporalStats(@Query() dateRange: DateRangeDto) {
    return await this.databricksService.getTemporalStats(
      dateRange.year,
      dateRange.month,
    );
  }

  @Get('categories')
  @CacheTTL(900)
  async getCategoryStats(@Query() filter: CategoryFilterDto) {
    return await this.databricksService.getCategoryStats(filter.limit || 10);
  }

  @Get('stores')
  @CacheTTL(900)
  async getStoreStats(@Query('limit') limit: number = 10) {
    return await this.databricksService.getStoreStats(limit);
  }
}