import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeRequest {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(2010)
  @Max(2030)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number;
}