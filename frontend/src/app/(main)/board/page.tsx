"use client";

import { useQuery } from "@tanstack/react-query";
import { KanbanBoard } from "@/components/KanbanBoard";
import { api } from "@/lib/api";
import type { Application } from "@/lib/types";

export default function BoardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["applications", "board"],
    queryFn: () =>
      api<{
        items: Application[];
      }>("/applications?limit=500&sort=updated_at:desc"),
  });

  if (isLoading) {
    return <p className="text-slate-600">加载看板…</p>;
  }

  const apps = data?.items ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold">求职看板</h1>
      <p className="mt-1 text-slate-600">
        拖拽卡片到目标列即可更新状态（乐观更新由后端持久化）。
      </p>
      <div className="mt-6">
        <KanbanBoard applications={apps} />
      </div>
    </div>
  );
}
