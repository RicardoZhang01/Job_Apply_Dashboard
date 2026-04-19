"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { CHANNEL_LABELS, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { Application } from "@/lib/types";
import { formatDt } from "@/lib/format";

type HistoryRow = {
  id: string;
  fromStatus: string | null;
  toStatus: string | null;
  actionType: string;
  content: string | null;
  createdAt: string;
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const qc = useQueryClient();
  const [note, setNote] = useState("");

  const { data: app, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () => api<Application>(`/applications/${id}`),
  });

  const { data: history } = useQuery({
    queryKey: ["application", id, "history"],
    queryFn: () => api<HistoryRow[]>(`/applications/${id}/history`),
  });

  const addNote = useMutation({
    mutationFn: () =>
      api(`/applications/${id}/history`, {
        method: "POST",
        body: JSON.stringify({ actionType: "NOTE", content: note }),
      }),
    onSuccess: () => {
      setNote("");
      void qc.invalidateQueries({ queryKey: ["application", id, "history"] });
    },
  });

  const remove = useMutation({
    mutationFn: () => api(`/applications/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["applications"] });
      router.push("/list");
    },
  });

  if (isLoading || !app) {
    return <p className="text-slate-600">加载中…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{app.companyName}</h1>
          <p className="text-lg text-slate-600">{app.roleName}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/applications/${id}/edit`}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            编辑
          </Link>
          <button
            type="button"
            className="rounded-lg border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
            onClick={() => {
              if (confirm("确定删除该申请？")) remove.mutate();
            }}
          >
            删除
          </button>
        </div>
      </div>

      <section className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <h2 className="font-semibold text-slate-900">基础信息</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">状态</dt>
              <dd>{STATUS_LABELS[app.status] ?? app.status}</dd>
            </div>
            <div>
              <dt className="text-slate-500">优先级</dt>
              <dd>{PRIORITY_LABELS[app.priority] ?? app.priority}</dd>
            </div>
            <div>
              <dt className="text-slate-500">渠道</dt>
              <dd>
                {app.sourceChannel
                  ? CHANNEL_LABELS[app.sourceChannel] ?? app.sourceChannel
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">地点</dt>
              <dd>{app.location ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">链接</dt>
              <dd>
                {app.jobUrl ? (
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    打开
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">时间节点</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">截止日期</dt>
              <dd>{formatDt(app.deadlineAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">投递时间</dt>
              <dd>{formatDt(app.appliedAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">下一场面试</dt>
              <dd>{formatDt(app.nextInterviewAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">最近更新</dt>
              <dd>{formatDt(app.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">材料状态</h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <li>简历：{app.resumeSubmitted ? "已提交" : "未提交"}</li>
          <li>求职信：{app.coverLetterSubmitted ? "已提交" : "未提交"}</li>
          <li>作品集：{app.portfolioSubmitted ? "已提交" : "未提交"}</li>
          <li>成绩单：{app.transcriptSubmitted ? "已提交" : "未提交"}</li>
        </ul>
      </section>

      {app.notes && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">备注</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
            {app.notes}
          </p>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">历史记录</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {history?.map((h) => (
            <li key={h.id} className="border-b border-slate-100 pb-3 last:border-0">
              <div className="text-xs text-slate-500">
                {formatDt(h.createdAt)} · {h.actionType}
              </div>
              {h.fromStatus && h.toStatus && (
                <div>
                  {STATUS_LABELS[h.fromStatus] ?? h.fromStatus} →{" "}
                  {STATUS_LABELS[h.toStatus] ?? h.toStatus}
                </div>
              )}
              {h.content && (
                <div className="mt-1 text-slate-700">{h.content}</div>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <label className="text-sm font-medium text-slate-700">追加备注</label>
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="面试准备、HR 沟通等"
          />
          <button
            type="button"
            className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
            disabled={!note.trim() || addNote.isPending}
            onClick={() => addNote.mutate()}
          >
            添加记录
          </button>
        </div>
      </section>
    </div>
  );
}
