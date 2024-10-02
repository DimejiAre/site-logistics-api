import { IsOptional, IsDateString, IsInt, IsArray, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetTicketsDto {
  @IsOptional()
  @Transform(({ value }) =>
    value.split(',').map((val: string) => parseInt(val, 10)),
  )
  @IsArray()
  @IsInt({ each: true })
  siteIds?: number[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  limit?: number = 100;
}
