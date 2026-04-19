"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type MeResponse = { user: { id: string; email: string } };

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/auth/me"),
    retry: false,
  });
}
