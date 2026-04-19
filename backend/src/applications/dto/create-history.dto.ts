import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateHistoryDto {
  @IsString()
  actionType!: string;

  @IsOptional()
  @IsString()
  content?: string;
}
