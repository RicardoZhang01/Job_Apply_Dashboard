"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import {
  CHANNEL_LABELS,
  FAILURE_TAG_LABELS,
  JOB_CATEGORY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { AiStatsInsightResponse } from "@/lib/types";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#0ea5e9",
  "#64748b",
];

export default function StatsPage() {
  const [aiInsightData, setAiInsightData] = useState<AiStatsInsightResponse | null>(
    null,
  );
  const [aiInsightInfo, setAiInsightInfo] = useState<string | null>(null);
  const aiInsight = useMutation({
    mutationFn: () =>
      api<AiStatsInsightResponse>("/ai/stats-insight", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onMutate: () => {
      setAiInsightData(null);
      setAiInsightInfo(null);
    },
    onSuccess: (res) => {
      if (!res.available) {
        setAiInsightInfo(res.reason ?? "AI 当前不可用，请稍后重试。");
        return;
      }
      setAiInsightData(res);
    },
    onError: (e: Error) => {
      // #region agent log
      fetch(
        "http://127.0.0.1:7289/ingest/ff4ba58b-9540-4559-bb1d-ce8a23537215",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "a9e5a9",
          },
          body: JSON.stringify({
            sessionId: "a9e5a9",
            location: "stats/page.tsx:aiInsight",
            message: "ai stats insight error",
            data: { err: e.message },
            timestamp: Date.now(),
            hypothesisId: "H-AI-CALL",
          }),
        },
      ).catch(() => {});
      // #endregion
      setAiInsightInfo(e.message || "AI 当前不可用，请稍后重试。");
    },
  });

  const { data: overview } = useQuery({
    queryKey: ["stats", "overview"],
    queryFn: () => api<{ byStatus: Record<string, number> }>("/stats/overview"),
  });

  const { data: funnel } = useQuery({
    queryKey: ["stats", "funnel"],
    queryFn: () =>
      api<{ stage: string; count: number }[]>("/stats/funnel"),
  });

  const { data: channels } = useQuery({
    queryKey: ["stats", "channels"],
    queryFn: () =>
      api<{ channel: string; count: number }[]>("/stats/channels"),
  });

  const { data: trends } = useQuery({
    queryKey: ["stats", "trends"],
    queryFn: () =>
      api<{ weeks: { weekStart: string; count: number }[] }>(
        "/stats/trends",
      ),
  });

  const { data: channelEff } = useQuery({
    queryKey: ["stats", "channel-effectiveness"],
    queryFn: () =>
      api<
        {
          channel: string;
          total: number;
          interviewRate: number;
          offerRate: number;
        }[]
      >("/stats/channel-effectiveness"),
  });

  const { data: byCategory } = useQuery({
    queryKey: ["stats", "by-job-category"],
    queryFn: () =>
      api<
        {
          jobCategory: string;
          total: number;
          interviewRate: number;
          offerRate: number;
        }[]
      >("/stats/by-job-category"),
  });

  const { data: failureBreakdown } = useQuery({
    queryKey: ["stats", "failure-breakdown"],
    queryFn: () =>
      api<{ failureTag: string; count: number }[]>(
        "/stats/failure-breakdown",
      ),
  });

  const pieData =
    overview?.byStatus &&
    Object.entries(overview.byStatus).map(([name, value]) => ({
      name: STATUS_LABELS[name] ?? name,
      value,
    }));

  const pieChartData = pieData ?? [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">统计分析</h1>
        <p className="mt-1 text-slate-600">
          渠道、漏斗与投递趋势；「进面率」按进入面试中或 Offer 的申请占比估算。
        </p>
        <div className="mt-3">
          <button
            type="button"
            className="rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
            disabled={aiInsight.isPending}
            onClick={() => aiInsight.mutate()}
          >
            {aiInsight.isPending ? "AI 解读生成中…" : "AI 解读本页统计"}
          </button>
        </div>
        {aiInsightInfo && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {aiInsightInfo}
          </div>
        )}
        {aiInsightData && (
          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-800">
            <div className="font-semibold text-indigo-800">
              {aiInsightData.headline}
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {aiInsightData.insights.map((i, idx) => (
                <li key={`${idx}-${i}`}>{i}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">状态分布</h2>
        <div className="h-72 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">转化漏斗（阶段人数）</h2>
        <div className="h-72 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" tickFormatter={(v) => STATUS_LABELS[v] ?? v} />
              <YAxis allowDecimals={false} />
              <Tooltip labelFormatter={(v) => STATUS_LABELS[v as string] ?? v} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">渠道分布</h2>
        <div className="h-72 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channels ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="channel"
                tickFormatter={(v) => CHANNEL_LABELS[v as string] ?? v}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                labelFormatter={(v) => CHANNEL_LABELS[v as string] ?? v}
              />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">渠道效果（复盘）</h2>
        <p className="mb-3 text-sm text-slate-600">
          进面率 =（面试中 + Offer）/ 该渠道申请数；Offer 率 = Offer / 该渠道申请数。
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">渠道</th>
                <th className="px-4 py-3 font-medium">申请数</th>
                <th className="px-4 py-3 font-medium">进面率</th>
                <th className="px-4 py-3 font-medium">Offer 率</th>
              </tr>
            </thead>
            <tbody>
              {(channelEff ?? []).map((row) => (
                <tr key={row.channel} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    {CHANNEL_LABELS[row.channel] ??
                      (row.channel === "UNKNOWN" ? "未填渠道" : row.channel)}
                  </td>
                  <td className="px-4 py-3">{row.total}</td>
                  <td className="px-4 py-3">
                    {(row.interviewRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    {(row.offerRate * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!channelEff?.length && (
            <p className="px-4 py-6 text-slate-500">暂无数据。</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">岗位大类复盘</h2>
        <p className="mb-3 text-sm text-slate-600">
          需在申请「高级字段」中填写岗位大类；未填记为「未分类」。
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">大类</th>
                <th className="px-4 py-3 font-medium">申请数</th>
                <th className="px-4 py-3 font-medium">进面率</th>
                <th className="px-4 py-3 font-medium">Offer 率</th>
              </tr>
            </thead>
            <tbody>
              {(byCategory ?? []).map((row) => (
                <tr key={row.jobCategory} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    {row.jobCategory === "UNSET"
                      ? "未分类"
                      : JOB_CATEGORY_LABELS[row.jobCategory] ?? row.jobCategory}
                  </td>
                  <td className="px-4 py-3">{row.total}</td>
                  <td className="px-4 py-3">
                    {(row.interviewRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    {(row.offerRate * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!byCategory?.length && (
            <p className="px-4 py-6 text-slate-500">暂无数据。</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">失败/结束原因分布</h2>
        <p className="mb-3 text-sm text-slate-600">
          仅统计填写了「未通过/结束原因」的申请。
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">原因</th>
                <th className="px-4 py-3 font-medium">次数</th>
              </tr>
            </thead>
            <tbody>
              {(failureBreakdown ?? []).map((row) => (
                <tr key={row.failureTag} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    {FAILURE_TAG_LABELS[row.failureTag] ?? row.failureTag}
                  </td>
                  <td className="px-4 py-3">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!failureBreakdown?.length && (
            <p className="px-4 py-6 text-slate-500">暂无标记数据。</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">近 8 周投递趋势</h2>
        <div className="h-72 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends?.weeks ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekStart" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
