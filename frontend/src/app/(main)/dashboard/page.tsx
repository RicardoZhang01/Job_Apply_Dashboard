"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import type { OverviewStats, ReminderItem } from "@/lib/types";

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

  const markRead = useMutation({
    mutationFn: (reminderKey: string) =>
      api("/reminders/read", {
        method: "PATCH",
        body: JSON.stringify({ reminderKey }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["reminders"] });
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
        <h2 className="mb-3 text-lg font-semibold">提醒</h2>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {!reminders?.items?.length && (
            <p className="text-slate-500">当前无待处理提醒。</p>
          )}
          <ul className="space-y-2">
            {reminders?.items.map((r) => (
              <li
                key={r.reminderKey}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-2 last:border-0"
              >
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
                    onClick={() => markRead.mutate(r.reminderKey)}
                  >
                    标记已读
                  </button>
                )}
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
