import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { APPLICATION_STATUSES, isActiveStatus } from '../common/constants';
import { calendarDaysBetween, startOfDayUtc } from '../lib/date-utils';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(userId: string) {
    const apps = await this.prisma.application.findMany({
      where: { userId },
    });
    const total = apps.length;
    const byStatus: Record<string, number> = {};
    APPLICATION_STATUSES.forEach((s) => {
      byStatus[s] = 0;
    });
    apps.forEach((a) => {
      byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
    });

    const now = new Date();
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const dueSoon = apps.filter(
      (a) =>
        a.deadlineAt &&
        isActiveStatus(a.status) &&
        a.deadlineAt <= threeDays &&
        a.deadlineAt >= startOfDayUtc(now),
    ).length;

    const todayStart = startOfDayUtc(now);
    const interviewsToday = apps.filter((a) => {
      if (!a.nextInterviewAt) return false;
      const iv = startOfDayUtc(a.nextInterviewAt);
      return iv.getTime() === todayStart.getTime();
    }).length;

    const interviewingOrOffer = apps.filter((a) =>
      ['INTERVIEWING', 'OFFER'].includes(a.status),
    ).length;
    const interviewRate = total ? interviewingOrOffer / total : 0;
    const offerCount = byStatus['OFFER'] ?? 0;
    const offerRate = total ? offerCount / total : 0;

    return {
      totalApplications: total,
      byStatus,
      dueSoonCount: dueSoon,
      interviewsToday,
      interviewRate,
      offerRate,
      offerCount,
      todoCount: byStatus['TODO'] ?? 0,
      appliedCount: byStatus['APPLIED'] ?? 0,
      interviewingCount: byStatus['INTERVIEWING'] ?? 0,
    };
  }

  async funnel(userId: string) {
    const apps = await this.prisma.application.findMany({ where: { userId } });
    const stages = [
      'TODO',
      'APPLIED',
      'ONLINE_TEST',
      'INTERVIEWING',
      'OFFER',
    ] as const;
    return stages.map((s) => ({
      stage: s,
      count: apps.filter((a) => a.status === s).length,
    }));
  }

  async channels(userId: string) {
    const apps = await this.prisma.application.findMany({
      where: { userId },
      select: { sourceChannel: true },
    });
    const map: Record<string, number> = {};
    apps.forEach((a) => {
      const k = a.sourceChannel ?? 'UNKNOWN';
      map[k] = (map[k] ?? 0) + 1;
    });
    return Object.entries(map).map(([channel, count]) => ({ channel, count }));
  }

  async trends(userId: string) {
    const apps = await this.prisma.application.findMany({
      where: { userId },
      select: { createdAt: true },
    });
    const now = new Date();
    const thisWeekStart = startOfWeekMondayUtc(now);
    const weeks: { weekStart: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const ws = new Date(
        thisWeekStart.getTime() - i * 7 * 24 * 60 * 60 * 1000,
      );
      const we = new Date(ws.getTime() + 7 * 24 * 60 * 60 * 1000);
      const count = apps.filter(
        (a) => a.createdAt >= ws && a.createdAt < we,
      ).length;
      weeks.push({ weekStart: ws.toISOString().slice(0, 10), count });
    }
    return { weeks };
  }

  /** 各渠道的「进面相关」占比与 Offer 占比（轻量定义：进面 = INTERVIEWING + OFFER） */
  async channelEffectiveness(userId: string) {
    const apps = await this.prisma.application.findMany({
      where: { userId },
      select: { sourceChannel: true, status: true },
    });
    type Agg = { total: number; interviewStage: number; offer: number };
    const map = new Map<string, Agg>();
    for (const a of apps) {
      const ch = a.sourceChannel ?? 'UNKNOWN';
      const cur = map.get(ch) ?? { total: 0, interviewStage: 0, offer: 0 };
      cur.total += 1;
      if (a.status === 'INTERVIEWING' || a.status === 'OFFER') {
        cur.interviewStage += 1;
      }
      if (a.status === 'OFFER') cur.offer += 1;
      map.set(ch, cur);
    }
    return [...map.entries()].map(([channel, v]) => ({
      channel,
      total: v.total,
      interviewRate: v.total ? v.interviewStage / v.total : 0,
      offerRate: v.total ? v.offer / v.total : 0,
    }));
  }

  /** 岗位大类维度数量与比率（未填 category 记为 UNSET） */
  async byJobCategory(userId: string) {
    const apps = await this.prisma.application.findMany({
      where: { userId },
      select: { jobCategory: true, status: true },
    });
    type Agg = { total: number; interviewStage: number; offer: number };
    const map = new Map<string, Agg>();
    for (const a of apps) {
      const key = a.jobCategory ?? 'UNSET';
      const cur = map.get(key) ?? { total: 0, interviewStage: 0, offer: 0 };
      cur.total += 1;
      if (a.status === 'INTERVIEWING' || a.status === 'OFFER') {
        cur.interviewStage += 1;
      }
      if (a.status === 'OFFER') cur.offer += 1;
      map.set(key, cur);
    }
    return [...map.entries()].map(([jobCategory, v]) => ({
      jobCategory,
      total: v.total,
      interviewRate: v.total ? v.interviewStage / v.total : 0,
      offerRate: v.total ? v.offer / v.total : 0,
    }));
  }

  /** 失败/结束原因标签分布（仅统计 failureTag 非空的申请） */
  async failureBreakdown(userId: string) {
    const rows = await this.prisma.application.findMany({
      where: { userId, failureTag: { not: null } },
      select: { failureTag: true },
    });
    const map: Record<string, number> = {};
    for (const r of rows) {
      const k = r.failureTag ?? 'OTHER';
      map[k] = (map[k] ?? 0) + 1;
    }
    return Object.entries(map).map(([failureTag, count]) => ({
      failureTag,
      count,
    }));
  }
}

function startOfWeekMondayUtc(d: Date): Date {
  const s = startOfDayUtc(d);
  const day = s.getUTCDay();
  const diffFromMonday = (day + 6) % 7;
  s.setUTCDate(s.getUTCDate() - diffFromMonday);
  return s;
}
