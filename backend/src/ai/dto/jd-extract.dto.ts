import { IsOptional, IsString, MaxLength } from 'class-validator';

export class JdExtractDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  jobUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30000)
  rawText?: string;
}
