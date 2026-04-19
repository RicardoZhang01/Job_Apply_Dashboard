"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type MeResponse = { user: { id: string; email: string } };

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const t0 = Date.now();
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
            location: "useMe.ts:queryFn",
            message: "auth/me fetch start",
            data: { phase: "start" },
            timestamp: Date.now(),
            hypothesisId: "H1",
          }),
        },
      ).catch(() => {});
      // #endregion
      try {
        const r = await api<MeResponse>("/auth/me");
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
              location: "useMe.ts:queryFn",
              message: "auth/me fetch ok",
              data: {
                phase: "ok",
                ms: Date.now() - t0,
                hasUser: !!r?.user,
              },
              timestamp: Date.now(),
              hypothesisId: "H1",
            }),
          },
        ).catch(() => {});
        // #endregion
        return r;
      } catch (e) {
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
              location: "useMe.ts:queryFn",
              message: "auth/me fetch error",
              data: {
                phase: "err",
                ms: Date.now() - t0,
                err: e instanceof Error ? e.message : String(e),
              },
              timestamp: Date.now(),
              hypothesisId: "H1",
            }),
          },
        ).catch(() => {});
        // #endregion
        throw e;
      }
    },
    retry: false,
  });
}
