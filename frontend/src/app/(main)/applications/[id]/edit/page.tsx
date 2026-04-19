"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ApplicationForm } from "@/components/ApplicationForm";
import { api } from "@/lib/api";
import type { Application } from "@/lib/types";

export default function EditApplicationPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () => api<Application>(`/applications/${id}`),
  });

  if (isLoading || !data) {
    return <p className="text-slate-600">加载中…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">编辑申请</h1>
      <div className="mt-6">
        <ApplicationForm mode="edit" initial={data} />
      </div>
    </div>
  );
}
