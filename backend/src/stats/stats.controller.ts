import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  overview(@CurrentUser() user: AuthUser) {
    return this.statsService.overview(user.id);
  }

  @Get('funnel')
  funnel(@CurrentUser() user: AuthUser) {
    return this.statsService.funnel(user.id);
  }

  @Get('channels')
  channels(@CurrentUser() user: AuthUser) {
    return this.statsService.channels(user.id);
  }

  @Get('trends')
  trends(@CurrentUser() user: AuthUser) {
    return this.statsService.trends(user.id);
  }

  @Get('channel-effectiveness')
  channelEffectiveness(@CurrentUser() user: AuthUser) {
    return this.statsService.channelEffectiveness(user.id);
  }

  @Get('by-job-category')
  byJobCategory(@CurrentUser() user: AuthUser) {
    return this.statsService.byJobCategory(user.id);
  }

  @Get('failure-breakdown')
  failureBreakdown(@CurrentUser() user: AuthUser) {
    return this.statsService.failureBreakdown(user.id);
  }
}
