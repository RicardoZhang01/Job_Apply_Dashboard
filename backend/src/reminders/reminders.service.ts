import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Application } from '@prisma/client';
import { ACTIVE_STATUSES, isActiveStatus } from '../common/constants';
import { calendarDaysBetween, startOfDayUtc } from '../lib/date-utils';
import { PrismaService } from '../prisma/prisma.service';

export type ReminderItem = {
  reminderKey: string;
  applicationId: string;
  type: string;
  title: string;
  remindAt: string;
  isRead: boolean;
  application: {
    companyName: string;
    roleName: string;
    status: string;
  };
};

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<{ items: ReminderItem[] }> {
    const apps = await this.prisma.application.findMany({
      where: { userId },
    });
    const readRows = await this.prisma.reminder.findMany({
      where: { userId },
    });
    const readSet = new Set(
      readRows.filter((r) => r.isRead).map((r) => r.reminderKey),
    );

    const items: ReminderItem[] = [];
    const now = new Date();

    for (const app of apps) {
      items.push(...this.deadlineReminders(app, now, readSet));
      items.push(...this.interviewReminders(app, now, readSet));
      items.push(...this.staleReminders(app, now, readSet));
      items.push(...this.materialReminders(app, readSet));
    }

    items.sort(
      (a, b) =>
        new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime(),
    );

    return { items };
  }

  async markRead(userId: string, reminderKey: string) {
    const applicationId = this.parseApplicationIdFromKey(reminderKey);
    if (!applicationId) {
      throw new BadRequestException('无效的 reminderKey');
    }
    const app = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
    });
    if (!app) {
      throw new NotFoundException('申请不存在');
    }
    await this.prisma.reminder.upsert({
      where: {
        userId_reminderKey: { userId, reminderKey },
      },
      create: {
        userId,
        applicationId,
        reminderKey,
        isRead: true,
      },
      update: { isRead: true },
    });
    return { ok: true };
  }

  /** 从 key 中解析 applicationId（UUID） */
  private parseApplicationIdFromKey(key: string): string | null {
    const uuidRe =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const m = key.match(uuidRe);
    return m ? m[0] : null;
  }

  private deadlineReminders(
    app: Application,
    now: Date,
    readSet: Set<string>,
  ): ReminderItem[] {
    if (!app.deadlineAt || !isActiveStatus(app.status)) return [];
    const days = calendarDaysBetween(startOfDayUtc(now), app.deadlineAt);
    const out: ReminderItem[] = [];
    const dIso = app.deadlineAt.toISOString().slice(0, 10);

    const add = (suffix: string, title: string, remindAt: Date) => {
      const reminderKey = `${suffix}:${app.id}:${dIso}`;
      out.push({
        reminderKey,
        applicationId: app.id,
        type: suffix,
        title,
        remindAt: remindAt.toISOString(),
        isRead: readSet.has(reminderKey),
        application: {
          companyName: app.companyName,
          roleName: app.roleName,
          status: app.status,
        },
      });
    };

    if (days === 7) {
      add('DEADLINE_7D', `「${app.companyName}」距离截止还有 7 天`, now);
    }
    if (days === 3) {
      add('DEADLINE_3D', `「${app.companyName}」距离截止还有 3 天`, now);
    }
    if (days === 0) {
      add('DEADLINE_TODAY', `「${app.companyName}」今日截止`, now);
    }
    if (days < 0) {
      add(
        'DEADLINE_OVERDUE',
        `「${app.companyName}」已过截止日期`,
        app.deadlineAt,
      );
    }
    return out;
  }

  private interviewReminders(
    app: Application,
    now: Date,
    readSet: Set<string>,
  ): ReminderItem[] {
    if (!app.nextInterviewAt) return [];
    const iv = app.nextInterviewAt;
    if (iv.getTime() < now.getTime()) return [];

    const daysToInterview = calendarDaysBetween(
      startOfDayUtc(now),
      startOfDayUtc(iv),
    );

    const out: ReminderItem[] = [];
    const ivIso = iv.toISOString();

    if (daysToInterview === 1) {
      const reminderKey = `INTERVIEW_1D:${app.id}:${ivIso}`;
      out.push({
        reminderKey,
        applicationId: app.id,
        type: 'INTERVIEW_1D',
        title: `「${app.companyName}」明日有面试`,
        remindAt: now.toISOString(),
        isRead: readSet.has(reminderKey),
        application: {
          companyName: app.companyName,
          roleName: app.roleName,
          status: app.status,
        },
      });
    }

    const msLeft = iv.getTime() - now.getTime();
    if (msLeft > 0 && msLeft <= 60 * 60 * 1000) {
      const reminderKey = `INTERVIEW_1H:${app.id}:${ivIso}`;
      out.push({
        reminderKey,
        applicationId: app.id,
        type: 'INTERVIEW_1H',
        title: `「${app.companyName}」面试将在 1 小时内开始`,
        remindAt: now.toISOString(),
        isRead: readSet.has(reminderKey),
        application: {
          companyName: app.companyName,
          roleName: app.roleName,
          status: app.status,
        },
      });
    }

    return out;
  }

  private staleReminders(
    app: Application,
    now: Date,
    readSet: Set<string>,
  ): ReminderItem[] {
    if (!ACTIVE_STATUSES.includes(app.status as (typeof ACTIVE_STATUSES)[number]))
      return [];
    const daysSinceUpdate = calendarDaysBetween(
      startOfDayUtc(app.updatedAt),
      startOfDayUtc(now),
    );
    if (daysSinceUpdate < 7) return [];
    const reminderKey = `STALE_7D:${app.id}`;
    return [
      {
        reminderKey,
        applicationId: app.id,
        type: 'STALE_7D',
        title: `「${app.companyName}」已 7 天未更新`,
        remindAt: now.toISOString(),
        isRead: readSet.has(reminderKey),
        application: {
          companyName: app.companyName,
          roleName: app.roleName,
          status: app.status,
        },
      },
    ];
  }

  private materialReminders(
    app: Application,
    readSet: Set<string>,
  ): ReminderItem[] {
    if (!ACTIVE_STATUSES.includes(app.status as (typeof ACTIVE_STATUSES)[number]))
      return [];
    const all =
      app.resumeSubmitted &&
      app.coverLetterSubmitted &&
      app.portfolioSubmitted &&
      app.transcriptSubmitted;
    if (all) return [];
    const reminderKey = `MATERIALS:${app.id}`;
    return [
      {
        reminderKey,
        applicationId: app.id,
        type: 'MATERIALS',
        title: `「${app.companyName}」材料未全部标记为已提交`,
        remindAt: new Date().toISOString(),
        isRead: readSet.has(reminderKey),
        application: {
          companyName: app.companyName,
          roleName: app.roleName,
          status: app.status,
        },
      },
    ];
  }
}
