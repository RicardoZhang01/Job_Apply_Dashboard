import { Transform } from 'class-transformer';
import { IsBooleanString, IsOptional, IsString, Max, Min } from 'class-validator';

const SORT_FIELDS = [
  'deadline_at',
  'updated_at',
  'applied_at',
  'priority',
  'created_at',
] as const;

export class QueryApplicationsDto {
  @IsOptional()
  @Transform(({ value }) => {
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  })
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n >= 1 ? Math.min(n, 500) : 20;
  })
  @Min(1)
  @Max(500)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  q?: string;

  /** 逗号分隔 status */
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  sourceChannel?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsBooleanString()
  nearDeadline?: string;

  @IsOptional()
  @IsBooleanString()
  hasInterview?: string;

  @IsOptional()
  @IsBooleanString()
  materialsComplete?: string;

  /** deadline_at:asc */
  @IsOptional()
  @IsString()
  sort?: string;
}

export function parseSort(sort?: string): {
  field: (typeof SORT_FIELDS)[number];
  dir: 'asc' | 'desc';
} {
  const def = { field: 'updated_at' as const, dir: 'desc' as const };
  if (!sort) return def;
  const [f, d] = sort.split(':');
  const field = SORT_FIELDS.includes(f as (typeof SORT_FIELDS)[number])
    ? (f as (typeof SORT_FIELDS)[number])
    : def.field;
  const dir = d === 'asc' || d === 'desc' ? d : def.dir;
  return { field, dir };
}
