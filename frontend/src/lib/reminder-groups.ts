import type { ReminderItem } from "@/lib/types";

export type ReminderGroupId =
  | "DEADLINE"
  | "INTERVIEW"
  | "MATERIALS"
  | "STALE"
  | "OTHER";

const ORDER: ReminderGroupId[] = [
  "DEADLINE",
  "INTERVIEW",
  "MATERIALS",
  "STALE",
  "OTHER",
];

const LABELS: Record<ReminderGroupId, string> = {
  DEADLINE: "截止相关",
  INTERVIEW: "面试相关",
  MATERIALS: "材料未完成",
  STALE: "长期未更新",
  OTHER: "其他",
};

export function reminderGroupFromType(type: string): ReminderGroupId {
  if (type.startsWith("DEADLINE")) return "DEADLINE";
  if (type.startsWith("INTERVIEW")) return "INTERVIEW";
  if (type === "MATERIALS") return "MATERIALS";
  if (type.startsWith("STALE")) return "STALE";
  return "OTHER";
}

export function groupRemindersByCategory(
  items: ReminderItem[],
): { id: ReminderGroupId; label: string; items: ReminderItem[] }[] {
  const map = new Map<ReminderGroupId, ReminderItem[]>();
  for (const id of ORDER) map.set(id, []);
  for (const r of items) {
    const gid = reminderGroupFromType(r.type);
    map.get(gid)!.push(r);
  }
  return ORDER.filter((id) => (map.get(id)?.length ?? 0) > 0).map((id) => ({
    id,
    label: LABELS[id],
    items: map.get(id)!,
  }));
}
