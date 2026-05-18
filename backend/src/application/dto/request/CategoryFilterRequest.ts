import { IsOptional, IsNumber, IsArray, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryFilterRequest {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}