import { Injectable } from '@nestjs/common';
import { ACTIVE_STATUSES, isActiveStatus } from '../common/constants';
import { calendarDaysBetween, startOfDayUtc } from '../lib/date-utils';
import { PrismaService } from '../prisma/prisma.service';
import { RemindersService } from '../reminders/reminders.service';

export type DashboardTodoItem = {
  todoKey: string;
  applicationId: string;
  title: string;
  kind: string;
  companyName: string;
  roleName: string;
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly remindersService: RemindersService,
  ) {}

  /** 聚合「今日值得处理」的申请与今日触发的提醒 */
  async todos(userId: string): Promise<{ items: DashboardTodoItem[] }> {
    const now = new Date();
    const todayStart = startOfDayUtc(now);
    const apps = await this.prisma.application.findMany({ where: { userId } });

    const seen = new Set<string>();
    const items: DashboardTodoItem[] = [];

    const push = (
      todoKey: string,
      applicationId: string,
      title: string,
      kind: string,
      companyName: string,
      roleName: string,
    ) => {
      if (seen.has(todoKey)) return;
      seen.add(todoKey);
      items.push({
        todoKey,
        applicationId,
        title,
        kind,
        companyName,
        roleName,
      });
    };

    for (const app of apps) {
      const cn = app.companyName;
      const rn = app.roleName;

      if (app.deadlineAt && isActiveStatus(app.status)) {
        const days = calendarDaysBetween(todayStart, app.deadlineAt);
        if (days === 0) {
          push(
            `deadline_today:${app.id}`,
            app.id,
            `「${cn}」今日截止`,
            'deadline_today',
            cn,
            rn,
          );
        } else if (days < 0) {
          push(
            `deadline_overdue:${app.id}`,
            app.id,
            `「${cn}」已过截止日期`,
            'deadline_overdue',
            cn,
            rn,
          );
        }
      }

      if (app.nextInterviewAt) {
        const d = calendarDaysBetween(now, app.nextInterviewAt);
        if (d === 0) {
          push(
            `interview_today:${app.id}`,
            app.id,
            `「${cn}」今日面试`,
            'interview_today',
            cn,
            rn,
          );
        }
      }

      if (app.writtenTestAt) {
        const d = calendarDaysBetween(now, app.writtenTestAt);
        if (d === 0) {
          push(
            `written_test_today:${app.id}`,
            app.id,
            `「${cn}」今日笔试`,
            'written_test_today',
            cn,
            rn,
          );
        }
      }

      const matsOk =
        app.resumeSubmitted &&
        app.coverLetterSubmitted &&
        app.portfolioSubmitted &&
        app.transcriptSubmitted;
      if (
        !matsOk &&
        ACTIVE_STATUSES.includes(app.status as (typeof ACTIVE_STATUSES)[number])
      ) {
        if (app.deadlineAt) {
          const db = calendarDaysBetween(todayStart, app.deadlineAt);
          if (db >= 0 && db <= 3) {
            push(
              `materials_near:${app.id}`,
              app.id,
              `「${cn}」截止临近且材料未全部标记`,
              'materials_near',
              cn,
              rn,
            );
          }
        }
      }

      if (
        ACTIVE_STATUSES.includes(app.status as (typeof ACTIVE_STATUSES)[number])
      ) {
        const staleDays = calendarDaysBetween(
          startOfDayUtc(app.updatedAt),
          todayStart,
        );
        if (staleDays >= 7) {
          push(
            `stale:${app.id}`,
            app.id,
            `「${cn}」已多日未更新，建议跟进`,
            'stale',
            cn,
            rn,
          );
        }
      }
    }

    const staleAppIds = new Set(
      items.filter((i) => i.kind === 'stale').map((i) => i.applicationId),
    );

    const { items: reminderRows } = await this.remindersService.list(userId);
    for (const r of reminderRows) {
      const remindDay = startOfDayUtc(new Date(r.remindAt));
      if (remindDay.getTime() !== todayStart.getTime()) continue;

      if (r.type.startsWith('STALE') && staleAppIds.has(r.applicationId)) {
        continue;
      }

      push(
        `rem:${r.reminderKey}`,
        r.applicationId,
        r.title,
        `reminder:${r.type}`,
        r.application.companyName,
        r.application.roleName,
      );
    }

    const kindOrder = (k: string) => {
      if (k.startsWith('deadline')) return 0;
      if (k === 'interview_today' || k === 'written_test_today') return 1;
      if (k === 'materials_near') return 2;
      if (k === 'stale') return 3;
      return 4;
    };
    items.sort((a, b) => kindOrder(a.kind) - kindOrder(b.kind));

    return { items };
  }
}
