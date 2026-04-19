"use client";

import type { Application } from "@/lib/types";
import { formatDt } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/constants";

export type HistoryRow = {
  id: string;
  fromStatus: string | null;
  toStatus: string | null;
  actionType: string;
  content: string | null;
  createdAt: string;
};

type TimelineEntry = {
  sortAt: string;
  title: string;
  detail?: string | null;
};

export function buildTimelineEntries(
  app: Application,
  history: HistoryRow[] | undefined,
): TimelineEntry[] {
  const rows: TimelineEntry[] = [];

  rows.push({
    sortAt: app.createdAt,
    title: "创建申请",
    detail: undefined,
  });

  if (app.appliedAt) {
    rows.push({
      sortAt: app.appliedAt,
      title: "投递",
      detail: undefined,
    });
  }
  if (app.writtenTestAt) {
    rows.push({
      sortAt: app.writtenTestAt,
      title: "笔试时间（节点）",
      detail: undefined,
    });
  }
  if (app.nextInterviewAt) {
    rows.push({
      sortAt: app.nextInterviewAt,
      title: "面试安排",
      detail: undefined,
    });
  }
  if (app.archivedAt) {
    rows.push({
      sortAt: app.archivedAt,
      title: "归档",
      detail: undefined,
    });
  }

  for (const h of history ?? []) {
    if (h.actionType === "CREATE") continue;
    let title = h.actionType;
    let detail = h.content ?? undefined;
    if (h.actionType === "STATUS_CHANGE" && h.fromStatus && h.toStatus) {
      title = `状态变更`;
      detail = `${STATUS_LABELS[h.fromStatus] ?? h.fromStatus} → ${STATUS_LABELS[h.toStatus] ?? h.toStatus}`;
    }
    if (h.actionType === "NOTE") {
      title = "追加记录";
      detail = h.content ?? undefined;
    }
    rows.push({
      sortAt: h.createdAt,
      title,
      detail,
    });
  }

  rows.sort(
    (a, b) =>
      new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime(),
  );

  const seen = new Set<string>();
  const deduped: TimelineEntry[] = [];
  for (const r of rows) {
    const key = `${r.sortAt}:${r.title}:${r.detail ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(r);
  }
  return deduped;
}

export function ApplicationTimeline({
  app,
  history,
}: {
  app: Application;
  history: HistoryRow[] | undefined;
}) {
  const entries = buildTimelineEntries(app, history);
  if (!entries.length) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">申请时间线</h2>
      <p className="mt-1 text-xs text-slate-500">
        关键日期与历史记录合并展示（最新在上）。
      </p>
      <ol className="relative mt-4 ml-2 border-l border-slate-200">
        {entries.map((e, i) => (
          <li
            key={`${e.sortAt}-${i}`}
            className="relative pb-8 pl-8 last:pb-0"
          >
            <span
              className="absolute left-0 top-1 z-10 ml-[-5px] h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-600 ring-2 ring-indigo-100"
              aria-hidden
            />
            <div className="text-xs text-slate-500">{formatDt(e.sortAt)}</div>
            <div className="font-medium text-slate-900">{e.title}</div>
            {e.detail && (
              <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {e.detail}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
