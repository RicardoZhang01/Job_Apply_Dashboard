import { IsString, MinLength } from 'class-validator';

export class ApplicationIdDto {
  @IsString()
  @MinLength(1)
  applicationId!: string;
}
