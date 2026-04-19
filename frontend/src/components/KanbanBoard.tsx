"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  APPLICATION_STATUSES,
  ApplicationStatus,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { Application } from "@/lib/types";
import { deadlineBadge } from "@/lib/format";

function Column({
  status,
  children,
}: {
  status: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[420px] w-[260px] shrink-0 flex-col rounded-xl border bg-slate-100 p-2 ${
        isOver ? "ring-2 ring-indigo-400" : "border-slate-200"
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1 text-sm font-medium text-slate-700">
        <span>{STATUS_LABELS[status] ?? status}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}

function Card({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: app.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const badge = deadlineBadge(app.deadlineAt);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-slate-200 bg-white p-3 shadow-sm ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div
        className="cursor-grab active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <Link
          href={`/applications/${app.id}`}
          className="font-medium text-indigo-700 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {app.companyName}
        </Link>
        <div className="mt-1 text-sm text-slate-600">{app.roleName}</div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {badge.label && (
            <span className={`rounded px-1.5 py-0.5 ${badge.className}`}>
              {badge.label}
            </span>
          )}
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
            {PRIORITY_LABELS[app.priority] ?? app.priority}
          </span>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          截止：{app.deadlineAt ? new Date(app.deadlineAt).toLocaleDateString("zh-CN") : "—"}
        </div>
      </div>
    </div>
  );
}

function resolveDropStatus(
  overId: string | undefined,
  apps: Application[],
): string | null {
  if (!overId) return null;
  if (APPLICATION_STATUSES.includes(overId as ApplicationStatus)) return overId;
  const target = apps.find((a) => a.id === overId);
  return target?.status ?? null;
}

export function KanbanBoard({ applications }: { applications: Application[] }) {
  const qc = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/applications/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["applications"] });
      void qc.invalidateQueries({ queryKey: ["stats"] });
      void qc.invalidateQueries({ queryKey: ["reminders"] });
    },
  });

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const dest = resolveDropStatus(String(over.id), applications);
    const activeId = String(active.id);
    const app = applications.find((a) => a.id === activeId);
    if (!dest || !app || dest === app.status) return;
    updateStatus.mutate({ id: activeId, status: dest });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {APPLICATION_STATUSES.map((status) => (
          <Column key={status} status={status}>
            {applications
              .filter((a) => a.status === status)
              .map((app) => (
                <Card key={app.id} app={app} />
              ))}
          </Column>
        ))}
      </div>
    </DndContext>
  );
}
