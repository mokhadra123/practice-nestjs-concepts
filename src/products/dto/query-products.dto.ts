import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  limit!: number;

  @IsOptional()
  @IsString()
  title?: string;
}
