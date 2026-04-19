"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import {
  APPLICATION_STATUSES,
  CHANNEL_LABELS,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  FAILURE_TAGS,
  FAILURE_TAG_LABELS,
  JOB_CATEGORIES,
  JOB_CATEGORY_LABELS,
  MATERIALS_LOCALES,
  MATERIALS_LOCALE_LABELS,
  PRIORITY_LABELS,
  SOURCE_CHANNELS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { Application } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  initial?: Application;
  /** 仅新建：仅核心字段，适合刷岗时快速保存 */
  compact?: boolean;
};

export function ApplicationForm({ mode, initial, compact }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  /** 编辑已有申请时默认展开高级字段（含失败原因、材料版本、岗位大类等），避免误以为只能新建时填写 */
  const [advanced, setAdvanced] = useState(
    () => mode === "edit" && !compact,
  );

  const [companyName, setCompanyName] = useState(initial?.companyName ?? "");
  const [roleName, setRoleName] = useState(initial?.roleName ?? "");
  const [status, setStatus] = useState(initial?.status ?? "TODO");
  const [priority, setPriority] = useState(initial?.priority ?? "MEDIUM");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [sourceChannel, setSourceChannel] = useState(
    initial?.sourceChannel ?? "",
  );
  const [jobUrl, setJobUrl] = useState(initial?.jobUrl ?? "");
  const [deadlineAt, setDeadlineAt] = useState(
    initial?.deadlineAt ? sliceLocal(initial.deadlineAt) : "",
  );
  const [appliedAt, setAppliedAt] = useState(
    initial?.appliedAt ? sliceLocal(initial.appliedAt) : "",
  );
  const [writtenTestAt, setWrittenTestAt] = useState(
    initial?.writtenTestAt ? sliceLocal(initial.writtenTestAt) : "",
  );
  const [nextInterviewAt, setNextInterviewAt] = useState(
    initial?.nextInterviewAt ? sliceLocal(initial.nextInterviewAt) : "",
  );
  const [resumeSubmitted, setResumeSubmitted] = useState(
    initial?.resumeSubmitted ?? false,
  );
  const [coverLetterSubmitted, setCoverLetterSubmitted] = useState(
    initial?.coverLetterSubmitted ?? false,
  );
  const [portfolioSubmitted, setPortfolioSubmitted] = useState(
    initial?.portfolioSubmitted ?? false,
  );
  const [transcriptSubmitted, setTranscriptSubmitted] = useState(
    initial?.transcriptSubmitted ?? false,
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [jdSummary, setJdSummary] = useState(initial?.jdSummary ?? "");
  const [companyNotes, setCompanyNotes] = useState(initial?.companyNotes ?? "");
  const [interviewPrepNotes, setInterviewPrepNotes] = useState(
    initial?.interviewPrepNotes ?? "",
  );
  const [hrNotes, setHrNotes] = useState(initial?.hrNotes ?? "");
  const [resumeVersionLabel, setResumeVersionLabel] = useState(
    initial?.resumeVersionLabel ?? "",
  );
  const [materialsLocale, setMaterialsLocale] = useState(
    initial?.materialsLocale ?? "",
  );
  const [resumeTailoredNote, setResumeTailoredNote] = useState(
    initial?.resumeTailoredNote ?? "",
  );
  const [jobCategory, setJobCategory] = useState(initial?.jobCategory ?? "");
  const [employmentType, setEmploymentType] = useState(
    initial?.employmentType ?? "",
  );
  const [failureTag, setFailureTag] = useState(initial?.failureTag ?? "");
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const body = {
        companyName,
        roleName,
        status,
        priority,
        location: location || undefined,
        sourceChannel: sourceChannel || undefined,
        jobUrl: jobUrl || undefined,
        deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : undefined,
        appliedAt: appliedAt ? new Date(appliedAt).toISOString() : undefined,
        writtenTestAt: writtenTestAt
          ? new Date(writtenTestAt).toISOString()
          : undefined,
        nextInterviewAt: nextInterviewAt
          ? new Date(nextInterviewAt).toISOString()
          : undefined,
        resumeSubmitted,
        coverLetterSubmitted,
        portfolioSubmitted,
        transcriptSubmitted,
        notes: notes || undefined,
        jdSummary: jdSummary || undefined,
        companyNotes: companyNotes || undefined,
        interviewPrepNotes: interviewPrepNotes || undefined,
        hrNotes: hrNotes || undefined,
        resumeVersionLabel: resumeVersionLabel || undefined,
        materialsLocale: materialsLocale || undefined,
        resumeTailoredNote: resumeTailoredNote || undefined,
        jobCategory: jobCategory || undefined,
        employmentType: employmentType || undefined,
        failureTag: failureTag || undefined,
      };
      if (mode === "create") {
        return api<Application>("/applications", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      return api<Application>(`/applications/${initial!.id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (app) => {
      void qc.invalidateQueries({ queryKey: ["applications"] });
      void qc.invalidateQueries({ queryKey: ["stats"] });
      void qc.invalidateQueries({ queryKey: ["reminders"] });
      void qc.invalidateQueries({ queryKey: ["dashboard", "todos"] });
      router.push(`/applications/${app.id}`);
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <form
      className="mx-auto max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        save.mutate();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm text-slate-600">公司名称 *</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-slate-600">岗位名称 *</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">当前状态 *</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        {!compact && (
          <div>
            <label className="text-sm text-slate-600">优先级</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        )}
        {compact && mode === "create" && (
          <>
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-600">岗位链接</label>
              <input
                type="url"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-600">截止日期（可选）</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={deadlineAt}
                onChange={(e) => setDeadlineAt(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {!compact && (
        <button
          type="button"
          className="text-sm text-indigo-600 hover:underline"
          onClick={() => setAdvanced((v) => !v)}
        >
          {advanced ? "收起高级字段" : "展开高级字段"}
        </button>
      )}

      {!compact && advanced && (
        <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600">工作地点</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">来源渠道</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={sourceChannel}
              onChange={(e) => setSourceChannel(e.target.value)}
            >
              <option value="">—</option>
              {SOURCE_CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-600">岗位链接</label>
            <input
              type="url"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">截止日期</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={deadlineAt}
              onChange={(e) => setDeadlineAt(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">投递时间</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">笔试时间</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={writtenTestAt}
              onChange={(e) => setWrittenTestAt(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-600">下一场面试</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={nextInterviewAt}
              onChange={(e) => setNextInterviewAt(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={resumeSubmitted}
                onChange={(e) => setResumeSubmitted(e.target.checked)}
              />
              简历已提交
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={coverLetterSubmitted}
                onChange={(e) => setCoverLetterSubmitted(e.target.checked)}
              />
              求职信已提交
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={portfolioSubmitted}
                onChange={(e) => setPortfolioSubmitted(e.target.checked)}
              />
              作品集已提交
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={transcriptSubmitted}
                onChange={(e) => setTranscriptSubmitted(e.target.checked)}
              />
              成绩单已提交
            </label>
          </div>
          <div className="sm:col-span-2 border-t border-slate-100 pt-4">
            <p className="mb-2 text-sm font-medium text-slate-700">
              材料版本（轻量）
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm text-slate-600">
                  简历版本名称（如：通用版 V3）
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={resumeVersionLabel}
                  onChange={(e) => setResumeVersionLabel(e.target.value)}
                  placeholder="可选"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">材料语言侧重</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={materialsLocale}
                  onChange={(e) => setMaterialsLocale(e.target.value)}
                >
                  <option value="">—</option>
                  {MATERIALS_LOCALES.map((c) => (
                    <option key={c} value={c}>
                      {MATERIALS_LOCALE_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-slate-600">
                  是否针对岗位定制（简述）
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={resumeTailoredNote}
                  onChange={(e) => setResumeTailoredNote(e.target.value)}
                  placeholder="例如：调整了项目关键词…"
                />
              </div>
            </div>
          </div>
          <div className="sm:col-span-2 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">岗位大类（复盘）</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value)}
              >
                <option value="">—</option>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {JOB_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600">招聘类型</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option value="">—</option>
                {EMPLOYMENT_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {EMPLOYMENT_TYPE_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-slate-600">
                未通过/结束原因（可选）
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={failureTag}
                onChange={(e) => setFailureTag(e.target.value)}
              >
                <option value="">—</option>
                {FAILURE_TAGS.map((c) => (
                  <option key={c} value={c}>
                    {FAILURE_TAG_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-600">JD 摘要</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={jdSummary}
              onChange={(e) => setJdSummary(e.target.value)}
              placeholder="岗位要求、关键词等"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-600">公司与业务备注</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={companyNotes}
              onChange={(e) => setCompanyNotes(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-600">面试准备</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={interviewPrepNotes}
              onChange={(e) => setInterviewPrepNotes(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-600">HR / 沟通备注</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={hrNotes}
              onChange={(e) => setHrNotes(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-600">自由备注</label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {compact && mode === "create" && (
        <p className="text-sm text-slate-600">
          更多字段请稍后在详情页编辑，或使用
          <a
            href="/applications/new"
            className="mx-1 text-indigo-600 hover:underline"
          >
            完整表单
          </a>
          新建。
        </p>
      )}

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {save.isPending ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50"
          onClick={() => router.back()}
        >
          取消
        </button>
      </div>
    </form>
  );
}

/** datetime-local 用的本地字符串 */
function sliceLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
