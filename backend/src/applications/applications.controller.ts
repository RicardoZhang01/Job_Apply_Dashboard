import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CreateHistoryDto } from './dto/create-history.dto';
import { PatchStatusDto } from './dto/patch-status.dto';
import {
  QueryApplicationsDto,
  parseSort,
} from './dto/query-applications.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryApplicationsDto) {
    const { field } = parseSort(query.sort);
    if (field === 'priority') {
      return this.applicationsService.findAllSorted(user.id, query);
    }
    return this.applicationsService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.applicationsService.findOne(user.id, id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.applicationsService.remove(user.id, id);
  }

  @Patch(':id/status')
  patchStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: PatchStatusDto,
  ) {
    return this.applicationsService.patchStatus(user.id, id, dto.status);
  }

  @Get(':id/history')
  getHistory(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.applicationsService.getHistory(user.id, id);
  }

  @Post(':id/history')
  addHistory(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateHistoryDto,
  ) {
    return this.applicationsService.addHistory(user.id, id, dto);
  }
}
