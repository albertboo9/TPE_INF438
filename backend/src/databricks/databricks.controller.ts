import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { DatabricksService } from './databricks.service';
import { DateRangeDto } from './dto/date-range.dto';
import { CategoryFilterDto } from './dto/category-filter.dto';

@Controller('stats')
export class DatabricksController {
  constructor(private readonly databricksService: DatabricksService) {}

  @Get('global')
  async getGlobalStats() {
    return await this.databricksService.getGlobalStats();
  }

  @Get('temporal')
  async getTemporalStats(@Query() dateRange: DateRangeDto) {
    return await this.databricksService.getTemporalStats(
      dateRange.year,
      dateRange.month,
    );
  }

  @Get('categories')
  async getCategoryStats(@Query() filter: CategoryFilterDto) {
    return await this.databricksService.getCategoryStats(filter.limit || 10);
  }

  @Get('stores')
  async getStoreStats(@Query('limit') limit: number = 10) {
    return await this.databricksService.getStoreStats(limit);
  }
}