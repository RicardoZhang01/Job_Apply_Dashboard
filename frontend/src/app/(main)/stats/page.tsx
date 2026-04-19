"use client";

import { useQuery } from "@tanstack/react-query";
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
import { STATUS_LABELS } from "@/lib/constants";

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
        <p className="mt-1 text-slate-600">渠道、漏斗与投递趋势（与后端数据一致）。</p>
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
              <XAxis dataKey="channel" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
