"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { api } from "@/lib/api";
import { groupRemindersByCategory } from "@/lib/reminder-groups";
import type { ReminderItem } from "@/lib/types";

export default function RemindersPage() {
  const qc = useQueryClient();
  const { data: reminders, isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: () => api<{ items: ReminderItem[] }>("/reminders"),
  });

  const grouped = useMemo(
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
    },
  });

  if (isLoading) {
    return <p className="text-slate-600">加载提醒…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">提醒中心</h1>
        <p className="mt-1 text-slate-600">
          按类型分组展示；与首页仪表盘使用同一数据源。
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {!reminders?.items?.length && (
          <p className="text-slate-500">当前无提醒。</p>
        )}
        <div className="space-y-8">
          {grouped.map((g) => (
            <section key={g.id}>
              <h2 className="mb-3 text-lg font-semibold text-slate-800">
                {g.label}
              </h2>
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                {g.items.map((r) => (
                  <li
                    key={r.reminderKey}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div>
                      <span
                        className={
                          r.isRead
                            ? "text-slate-600"
                            : "font-medium text-slate-900"
                        }
                      >
                        {r.title}
                      </span>
                      <div className="mt-1 text-xs text-slate-500">
                        {r.application.companyName} · {r.application.roleName}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Link
                        href={`/applications/${r.applicationId}`}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        查看申请
                      </Link>
                      {!r.isRead && (
                        <button
                          type="button"
                          className="text-sm text-slate-600 hover:text-slate-900"
                          onClick={() => markRead.mutate(r.reminderKey)}
                        >
                          标记已读
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
