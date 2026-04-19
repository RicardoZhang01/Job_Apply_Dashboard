import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  FAILURE_TAGS,
  JOB_CATEGORIES,
  MATERIALS_LOCALES,
  PRIORITIES,
  SOURCE_CHANNELS,
} from '../../common/constants';

export class CreateApplicationDto {
  @IsString()
  @MinLength(1)
  companyName!: string;

  @IsString()
  @MinLength(1)
  roleName!: string;

  @IsString()
  @IsIn([...APPLICATION_STATUSES])
  status!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  @IsIn([...SOURCE_CHANNELS])
  sourceChannel?: string;

  @IsOptional()
  @IsString()
  jobUrl?: string;

  @IsOptional()
  @IsString()
  @IsIn([...PRIORITIES])
  priority?: string;

  @IsOptional()
  @IsDateString()
  deadlineAt?: string;

  @IsOptional()
  @IsDateString()
  appliedAt?: string;

  @IsOptional()
  @IsDateString()
  writtenTestAt?: string;

  @IsOptional()
  @IsDateString()
  nextInterviewAt?: string;

  @IsOptional()
  @IsBoolean()
  resumeSubmitted?: boolean;

  @IsOptional()
  @IsBoolean()
  coverLetterSubmitted?: boolean;

  @IsOptional()
  @IsBoolean()
  portfolioSubmitted?: boolean;

  @IsOptional()
  @IsBoolean()
  transcriptSubmitted?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  jdSummary?: string;

  @IsOptional()
  @IsString()
  companyNotes?: string;

  @IsOptional()
  @IsString()
  interviewPrepNotes?: string;

  @IsOptional()
  @IsString()
  hrNotes?: string;

  @IsOptional()
  @IsString()
  resumeVersionLabel?: string;

  @IsOptional()
  @IsString()
  @IsIn([...MATERIALS_LOCALES])
  materialsLocale?: string;

  @IsOptional()
  @IsString()
  resumeTailoredNote?: string;

  @IsOptional()
  @IsString()
  @IsIn([...JOB_CATEGORIES])
  jobCategory?: string;

  @IsOptional()
  @IsString()
  @IsIn([...EMPLOYMENT_TYPES])
  employmentType?: string;

  @IsOptional()
  @IsString()
  @IsIn([...FAILURE_TAGS])
  failureTag?: string;
}
