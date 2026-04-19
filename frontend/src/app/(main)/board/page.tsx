"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { api } from "@/lib/api";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
} from "@/lib/constants";
import type { Application } from "@/lib/types";

export default function BoardPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["applications", "board"],
    queryFn: () =>
      api<{
        items: Application[];
      }>("/applications?limit=500&sort=updated_at:desc"),
  });

  const items = data?.items;

  const filtered = useMemo(() => {
    if (!items?.length) return [];
    let list = items;
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (a) =>
          a.companyName.toLowerCase().includes(s) ||
          a.roleName.toLowerCase().includes(s),
      );
    }
    if (statusFilter) {
      list = list.filter((a) => a.status === statusFilter);
    }
    return list;
  }, [items, q, statusFilter]);

  if (isLoading) {
    return <p className="text-slate-600">加载看板…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">求职看板</h1>
      <p className="mt-1 text-slate-600">
        拖拽卡片到目标列即可更新状态（乐观更新由后端持久化）。
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="min-w-[200px] flex-1">
          <label className="text-sm text-slate-600">搜索公司 / 岗位</label>
          <input
            type="search"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="输入关键字过滤当前已加载卡片"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="text-sm text-slate-600">按状态筛选</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">全部状态</option>
            {APPLICATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABELS[st] ?? st}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        当前显示 {filtered.length} / {items?.length ?? 0} 条
      </p>

      <div className="mt-6">
        <KanbanBoard applications={filtered} />
      </div>
    </div>
  );
}
