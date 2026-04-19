"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { api } from "@/lib/api";
import {
  APPLICATION_STATUSES,
  CHANNEL_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { Application } from "@/lib/types";
import { formatDt } from "@/lib/format";

export function ListContent() {
  const searchParams = useSearchParams();
  const qs = useMemo(() => {
    const p = new URLSearchParams();
    const status = searchParams.get("status");
    const near = searchParams.get("nearDeadline");
    const q = searchParams.get("q");
    const sort = searchParams.get("sort") ?? "deadline_at:asc";
    if (status) p.set("status", status);
    if (near === "true") p.set("nearDeadline", "true");
    if (q) p.set("q", q);
    p.set("sort", sort);
    p.set("limit", "50");
    return p.toString();
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["applications", "list", qs],
    queryFn: () =>
      api<{ items: Application[]; total: number; page: number }>(
        `/applications?${qs}`,
      ),
  });

  return (
    <>
      <h1 className="text-2xl font-bold">申请列表</h1>
      <p className="mt-1 text-slate-600">表格视图，支持 URL 查询参数筛选。</p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">公司</th>
              <th className="px-3 py-2">岗位</th>
              <th className="px-3 py-2">状态</th>
              <th className="px-3 py-2">截止</th>
              <th className="px-3 py-2">投递日</th>
              <th className="px-3 py-2">面试</th>
              <th className="px-3 py-2">渠道</th>
              <th className="px-3 py-2">优先级</th>
              <th className="px-3 py-2">更新</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                  加载中…
                </td>
              </tr>
            )}
            {!isLoading &&
              data?.items.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <Link
                      href={`/applications/${a.id}`}
                      className="font-medium text-indigo-700 hover:underline"
                    >
                      {a.companyName}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{a.roleName}</td>
                  <td className="px-3 py-2">{STATUS_LABELS[a.status] ?? a.status}</td>
                  <td className="px-3 py-2">{formatDt(a.deadlineAt)}</td>
                  <td className="px-3 py-2">{formatDt(a.appliedAt)}</td>
                  <td className="px-3 py-2">{formatDt(a.nextInterviewAt)}</td>
                  <td className="px-3 py-2">
                    {a.sourceChannel
                      ? CHANNEL_LABELS[a.sourceChannel] ?? a.sourceChannel
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {PRIORITY_LABELS[a.priority] ?? a.priority}
                  </td>
                  <td className="px-3 py-2">{formatDt(a.updatedAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        状态枚举：
        {APPLICATION_STATUSES.map((s) => STATUS_LABELS[s]).join(" / ")}
      </p>
    </>
  );
}
