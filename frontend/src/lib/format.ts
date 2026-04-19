export function formatDt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function deadlineBadge(deadlineAt: string | null): {
  label?: string;
  className: string;
} {
  if (!deadlineAt) return { className: "" };
  const now = new Date();
  const d = new Date(deadlineAt);
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(
    (startOfDay(d).getTime() - startOfDay(now).getTime()) / dayMs,
  );
  if (diffDays < 0)
    return { label: "已过期", className: "bg-red-100 text-red-800" };
  if (diffDays <= 3)
    return { label: "紧急", className: "bg-orange-100 text-orange-800" };
  if (diffDays <= 7)
    return { label: "临近", className: "bg-amber-100 text-amber-800" };
  return { className: "" };
}

function startOfDay(dt: Date): Date {
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}
