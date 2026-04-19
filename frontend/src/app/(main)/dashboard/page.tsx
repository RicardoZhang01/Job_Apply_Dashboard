"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { api } from "@/lib/api";
import { groupRemindersByCategory } from "@/lib/reminder-groups";
import type {
  Application,
  DashboardTodoItem,
  OverviewStats,
  ReminderItem,
} from "@/lib/types";
import { formatDt } from "@/lib/format";

function StatCard({
  title,
  value,
  href,
  highlight,
}: {
  title: string;
  value: number | string;
  href?: string;
  highlight?: boolean;
}) {
  const inner = (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        highlight
          ? "border-amber-300 bg-amber-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block transition hover:opacity-90">
        {inner}
      </Link>
    );
  }
  return inner;
}

function ReminderListItem({
  r,
  onMarkRead,
}: {
  r: ReminderItem;
  onMarkRead: (key: string) => void;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
      <div>
        <span
          className={
            r.isRead ? "text-slate-500" : "font-medium text-slate-900"
          }
        >
          {r.title}
        </span>
        <Link
          href={`/applications/${r.applicationId}`}
          className="ml-2 text-sm text-indigo-600 hover:underline"
        >
          查看
        </Link>
      </div>
      {!r.isRead && (
        <button
          type="button"
          className="text-sm text-slate-600 hover:text-slate-900"
          onClick={() => onMarkRead(r.reminderKey)}
        >
          标记已读
        </button>
      )}
    </li>
  );
}

export default function DashboardPage() {
  const qc = useQueryClient();
  const { data: overview } = useQuery({
    queryKey: ["stats", "overview"],
    queryFn: () => api<OverviewStats>("/stats/overview"),
  });

  const { data: reminders } = useQuery({
    queryKey: ["reminders"],
    queryFn: () => api<{ items: ReminderItem[] }>("/reminders"),
  });

  const { data: todos } = useQuery({
    queryKey: ["dashboard", "todos"],
    queryFn: () => api<{ items: DashboardTodoItem[] }>("/dashboard/todos"),
  });

  const { data: recentApps } = useQuery({
    queryKey: ["applications", "recent-dashboard"],
    queryFn: () =>
      api<{ items: Application[] }>(
        "/applications?limit=5&sort=updated_at:desc",
      ),
  });

  const groupedReminders = useMemo(
    () => groupRemindersByCategory(reminders?.items ?? []),
    [reminders?.items],
  );

  const markRead = useMutation({
    mutationFn: (reminderKey: string) =>
      api("/reminders/read", {
        method: "PATCH",
        body: JSON.stringify({ reminderKey }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["reminders"] });
      void qc.invalidateQueries({ queryKey: ["dashboard", "todos"] });
    },
  });

  const o = overview;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">首页仪表盘</h1>
        <p className="mt-1 text-slate-600">
          总览申请进度与近期提醒（数据来自后端实时计算）
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">今日待办</h2>
        <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
          {!todos?.items?.length && (
            <p className="text-slate-500">
              今日暂无聚合待办（截止/面试/笔试与跟进项会出现在这里）。
            </p>
          )}
          <ul className="divide-y divide-slate-100">
            {todos?.items.map((t) => (
              <li
                key={t.todoKey}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <span className="font-medium text-slate-900">{t.title}</span>
                  <div className="truncate text-xs text-slate-500">
                    {t.companyName} · {t.roleName}
                  </div>
                </div>
                <Link
                  href={`/applications/${t.applicationId}`}
                  className="shrink-0 text-sm text-indigo-600 hover:underline"
                >
                  去处理
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-semibold">今日重点提醒</h2>
          <Link
            href="/reminders"
            className="text-sm text-indigo-600 hover:underline"
          >
            查看全部提醒
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {!reminders?.items?.length && (
            <p className="text-slate-500">当前无待处理提醒。</p>
          )}
          {groupedReminders.map((g) => (
            <div key={g.id} className="mb-4 last:mb-0">
              <h3 className="mb-2 text-sm font-medium text-slate-700">
                {g.label}
              </h3>
              <ul className="space-y-0">
                {g.items.map((r) => (
                  <ReminderListItem
                    key={r.reminderKey}
                    r={r}
                    onMarkRead={(key) => markRead.mutate(key)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">关键指标</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="总申请" value={o?.totalApplications ?? "—"} />
          <StatCard
            title="待投递"
            value={o?.todoCount ?? "—"}
            href="/list?status=TODO"
          />
          <StatCard
            title="已投递"
            value={o?.appliedCount ?? "—"}
            href="/list?status=APPLIED"
          />
          <StatCard
            title="面试中"
            value={o?.interviewingCount ?? "—"}
            href="/list?status=INTERVIEWING"
          />
          <StatCard title="Offer" value={o?.offerCount ?? "—"} />
          <StatCard
            title="即将截止(3天内)"
            value={o?.dueSoonCount ?? "—"}
            href="/list?nearDeadline=true"
            highlight
          />
          <StatCard
            title="今日面试"
            value={o?.interviewsToday ?? "—"}
            highlight
          />
          <StatCard
            title="面试率"
            value={
              o ? `${(o.interviewRate * 100).toFixed(1)}%` : "—"
            }
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-semibold">最近更新</h2>
          <Link href="/list" className="text-sm text-indigo-600 hover:underline">
            全部列表
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {!recentApps?.items?.length && (
            <p className="text-slate-500">暂无申请记录。</p>
          )}
          <ul className="divide-y divide-slate-100">
            {recentApps?.items.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div>
                  <Link
                    href={`/applications/${a.id}`}
                    className="font-medium text-indigo-700 hover:underline"
                  >
                    {a.companyName}
                  </Link>
                  <span className="ml-2 text-sm text-slate-600">{a.roleName}</span>
                </div>
                <span className="text-xs text-slate-500">
                  更新 {formatDt(a.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">快捷入口</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/board"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            打开看板
          </Link>
          <Link
            href="/list"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50"
          >
            申请列表
          </Link>
          <Link
            href="/stats"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50"
          >
            统计分析
          </Link>
        </div>
      </section>
    </div>
  );
}
