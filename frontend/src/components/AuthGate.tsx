"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "@/hooks/useMe";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useMe();

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
          location: "AuthGate.tsx:state",
          message: "AuthGate state snapshot",
          data: {
            isLoading,
            isError,
            hasData: !!data?.user,
          },
          timestamp: Date.now(),
          hypothesisId: "H4",
        }),
      },
    ).catch(() => {});
    // #endregion
  }, [isLoading, isError, data?.user]);

  useEffect(() => {
    if (!isLoading && isError) {
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
            location: "AuthGate.tsx:redirect-login",
            message: "AuthGate redirect login",
            data: { reason: "isError true" },
            timestamp: Date.now(),
            hypothesisId: "H4",
          }),
        },
      ).catch(() => {});
      // #endregion
      router.replace("/login");
    }
  }, [isLoading, isError, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        加载中…
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  return <>{children}</>;
}
