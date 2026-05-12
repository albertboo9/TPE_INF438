import { IsOptional, IsArray, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryFilterDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}