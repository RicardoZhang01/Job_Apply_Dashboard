import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { ApplicationIdDto } from './dto/application-id.dto';
import { JdExtractDto } from './dto/jd-extract.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('jd-extract')
  jdExtract(@CurrentUser() user: AuthUser, @Body() dto: JdExtractDto) {
    return this.aiService.jdExtract(user.id, dto);
  }

  @Post('next-actions')
  nextActions(@CurrentUser() user: AuthUser, @Body() dto: ApplicationIdDto) {
    return this.aiService.nextActions(user.id, dto);
  }

  @Post('resume-suggest')
  resumeSuggest(@CurrentUser() user: AuthUser, @Body() dto: ApplicationIdDto) {
    return this.aiService.resumeSuggest(user.id, dto);
  }

  @Post('interview-prep')
  interviewPrep(@CurrentUser() user: AuthUser, @Body() dto: ApplicationIdDto) {
    return this.aiService.interviewPrep(user.id, dto);
  }

  @Post('stats-insight')
  statsInsight(@CurrentUser() user: AuthUser) {
    return this.aiService.statsInsight(user.id);
  }

  @Get('dashboard-digest')
  dashboardDigest(@CurrentUser() user: AuthUser) {
    return this.aiService.dashboardDigest(user.id);
  }
}
