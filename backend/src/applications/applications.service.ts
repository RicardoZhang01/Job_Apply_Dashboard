import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ACTIVE_STATUSES, APPLICATION_STATUSES } from '../common/constants';
import { calendarDaysBetween, startOfDayUtc } from '../lib/date-utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CreateHistoryDto } from './dto/create-history.dto';
import {
  QueryApplicationsDto,
  parseSort,
} from './dto/query-applications.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

function mapPriorityOrder(p: string): number {
  switch (p) {
    case 'HIGH':
      return 0;
    case 'MEDIUM':
      return 1;
    case 'LOW':
      return 2;
    default:
      return 99;
  }
}

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const data = this.toCreateData(userId, dto);
    const app = await this.prisma.application.create({
      data,
    });
    await this.prisma.applicationHistory.create({
      data: {
        applicationId: app.id,
        fromStatus: null,
        toStatus: dto.status,
        actionType: 'CREATE',
      },
    });
    return app;
  }

  async findAll(userId: string, query: QueryApplicationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(userId, query);
    const { field, dir } = parseSort(query.sort);

    const orderBy = this.buildOrderBy(field, dir);

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  private buildOrderBy(
    field: string,
    dir: 'asc' | 'desc',
  ): Prisma.ApplicationOrderByWithRelationInput[] {
    if (field === 'priority') {
      // SQLite: 用多条排序模拟枚举顺序
      return [{ updatedAt: 'desc' }];
    }
    const map: Record<string, keyof Prisma.ApplicationOrderByWithRelationInput> =
      {
        deadline_at: 'deadlineAt',
        updated_at: 'updatedAt',
        applied_at: 'appliedAt',
        created_at: 'createdAt',
      };
    const key = map[field] ?? 'updatedAt';
    return [{ [key]: dir }];
  }

  /** 列表内存排序 priority（Prisma SQLite 不便直接排枚举） */
  async findAllSorted(userId: string, query: QueryApplicationsDto) {
    const { field, dir } = parseSort(query.sort);
    if (field !== 'priority') {
      return this.findAll(userId, query);
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(userId, query);
    const all = await this.prisma.application.findMany({ where });
    all.sort((a, b) => {
      const da = mapPriorityOrder(a.priority);
      const db = mapPriorityOrder(b.priority);
      if (da !== db) return dir === 'asc' ? da - db : db - da;
      return (
        (b.updatedAt.getTime() - a.updatedAt.getTime()) *
        (dir === 'asc' ? -1 : 1)
      );
    });
    const total = all.length;
    const items = all.slice((page - 1) * limit, page * limit);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  private buildWhere(
    userId: string,
    query: QueryApplicationsDto,
  ): Prisma.ApplicationWhereInput {
    const parts: Prisma.ApplicationWhereInput[] = [{ userId }];

    if (query.q?.trim()) {
      const q = query.q.trim();
      parts.push({
        OR: [
          { companyName: { contains: q } },
          { roleName: { contains: q } },
          { notes: { contains: q } },
        ],
      });
    }
    if (query.status) {
      const list = query.status.split(',').filter(Boolean);
      if (list.length) parts.push({ status: { in: list } });
    }
    if (query.sourceChannel) {
      parts.push({ sourceChannel: query.sourceChannel });
    }
    if (query.priority) {
      parts.push({ priority: query.priority });
    }

    const now = new Date();
    if (query.nearDeadline === 'true') {
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      parts.push({
        deadlineAt: { lte: weekLater, gte: startOfDayUtc(now) },
      });
    }
    if (query.hasInterview === 'true') {
      parts.push({ nextInterviewAt: { not: null } });
    }
    if (query.materialsComplete === 'true') {
      parts.push({
        resumeSubmitted: true,
        coverLetterSubmitted: true,
        portfolioSubmitted: true,
        transcriptSubmitted: true,
      });
    }
    if (query.materialsComplete === 'false') {
      parts.push({
        OR: [
          { resumeSubmitted: false },
          { coverLetterSubmitted: false },
          { portfolioSubmitted: false },
          { transcriptSubmitted: false },
        ],
      });
    }

    return { AND: parts };
  }

  async findOne(userId: string, id: string) {
    const app = await this.prisma.application.findFirst({
      where: { id, userId },
    });
    if (!app) throw new NotFoundException('申请不存在');
    return app;
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    await this.ensureOwner(userId, id);
    const prev = await this.prisma.application.findUniqueOrThrow({
      where: { id },
    });
    const data = this.toUpdateData(dto);
    const app = await this.prisma.application.update({
      where: { id },
      data,
    });
    if (dto.status && dto.status !== prev.status) {
      await this.prisma.applicationHistory.create({
        data: {
          applicationId: id,
          fromStatus: prev.status,
          toStatus: dto.status,
          actionType: 'STATUS_CHANGE',
        },
      });
    }
    return app;
  }

  async remove(userId: string, id: string) {
    await this.ensureOwner(userId, id);
    await this.prisma.application.delete({ where: { id } });
    return { ok: true };
  }

  async patchStatus(userId: string, id: string, status: string) {
    await this.ensureOwner(userId, id);
    const prev = await this.prisma.application.findUniqueOrThrow({
      where: { id },
    });
    if (prev.status === status) return prev;
    const app = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: { status },
      });
      await tx.applicationHistory.create({
        data: {
          applicationId: id,
          fromStatus: prev.status,
          toStatus: status,
          actionType: 'STATUS_CHANGE',
        },
      });
      return updated;
    });
    return app;
  }

  async getHistory(userId: string, applicationId: string) {
    await this.ensureOwner(userId, applicationId);
    return this.prisma.applicationHistory.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addHistory(
    userId: string,
    applicationId: string,
    dto: CreateHistoryDto,
  ) {
    await this.ensureOwner(userId, applicationId);
    return this.prisma.applicationHistory.create({
      data: {
        applicationId,
        fromStatus: null,
        toStatus: null,
        actionType: dto.actionType,
        content: dto.content ?? null,
      },
    });
  }

  private async ensureOwner(userId: string, id: string) {
    const app = await this.prisma.application.findFirst({
      where: { id, userId },
    });
    if (!app) throw new NotFoundException('申请不存在');
  }

  private toCreateData(userId: string, dto: CreateApplicationDto) {
    return {
      userId,
      companyName: dto.companyName,
      roleName: dto.roleName,
      status: dto.status,
      location: dto.location ?? null,
      sourceChannel: dto.sourceChannel ?? null,
      jobUrl: dto.jobUrl ?? null,
      priority: dto.priority ?? 'MEDIUM',
      deadlineAt: dto.deadlineAt ? new Date(dto.deadlineAt) : null,
      appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : null,
      nextInterviewAt: dto.nextInterviewAt
        ? new Date(dto.nextInterviewAt)
        : null,
      resumeSubmitted: dto.resumeSubmitted ?? false,
      coverLetterSubmitted: dto.coverLetterSubmitted ?? false,
      portfolioSubmitted: dto.portfolioSubmitted ?? false,
      transcriptSubmitted: dto.transcriptSubmitted ?? false,
      notes: dto.notes ?? null,
    };
  }

  private toUpdateData(dto: UpdateApplicationDto): Prisma.ApplicationUpdateInput {
    const data: Prisma.ApplicationUpdateInput = {};
    if (dto.companyName !== undefined) data.companyName = dto.companyName;
    if (dto.roleName !== undefined) data.roleName = dto.roleName;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.sourceChannel !== undefined) data.sourceChannel = dto.sourceChannel;
    if (dto.jobUrl !== undefined) data.jobUrl = dto.jobUrl;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.deadlineAt !== undefined)
      data.deadlineAt = dto.deadlineAt ? new Date(dto.deadlineAt) : null;
    if (dto.appliedAt !== undefined)
      data.appliedAt = dto.appliedAt ? new Date(dto.appliedAt) : null;
    if (dto.nextInterviewAt !== undefined)
      data.nextInterviewAt = dto.nextInterviewAt
        ? new Date(dto.nextInterviewAt)
        : null;
    if (dto.resumeSubmitted !== undefined)
      data.resumeSubmitted = dto.resumeSubmitted;
    if (dto.coverLetterSubmitted !== undefined)
      data.coverLetterSubmitted = dto.coverLetterSubmitted;
    if (dto.portfolioSubmitted !== undefined)
      data.portfolioSubmitted = dto.portfolioSubmitted;
    if (dto.transcriptSubmitted !== undefined)
      data.transcriptSubmitted = dto.transcriptSubmitted;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.status === 'ARCHIVED') {
      data.archivedAt = new Date();
    }
    return data;
  }
}
