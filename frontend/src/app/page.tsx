"use client";

import { useMe } from "@/hooks/useMe";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const me = useMe();
  const {
    isLoading,
    isError,
    isPending,
    isFetching,
    isPaused,
    status,
    fetchStatus,
  } = me;

  useEffect(() => {
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
          location: "page.tsx:render-effect-deps",
          message: "HomePage query state snapshot",
          data: {
            isLoading,
            isError,
            isPending,
            isFetching,
            isPaused,
            status,
            fetchStatus,
          },
          timestamp: Date.now(),
          hypothesisId: "H2",
        }),
      },
    ).catch(() => {});
    // #endregion
  }, [
    isLoading,
    isError,
    isPending,
    isFetching,
    isPaused,
    status,
    fetchStatus,
  ]);

  useEffect(() => {
    if (!isLoading) {
      const dest = isError ? "/login" : "/dashboard";
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
            location: "page.tsx:redirect",
            message: "router.replace invoked",
            data: { dest, isError },
            timestamp: Date.now(),
            hypothesisId: "H3",
          }),
        },
      ).catch(() => {});
      // #endregion
      router.replace(dest);
      const t = window.setTimeout(() => {
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
              location: "page.tsx:after-replace",
              message: "pathname after replace (100ms)",
              data: {
                pathname:
                  typeof window !== "undefined" ? window.location.pathname : "",
              },
              timestamp: Date.now(),
              hypothesisId: "H3",
            }),
          },
        ).catch(() => {});
        // #endregion
      }, 100);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [isLoading, isError, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-600">
      正在跳转…
    </div>
  );
}
