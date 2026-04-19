"use client";

import { useMe } from "@/hooks/useMe";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { isLoading, isError } = useMe();

  useEffect(() => {
    if (!isLoading) {
      if (isError) router.replace("/login");
      else router.replace("/dashboard");
    }
  }, [isLoading, isError, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-600">
      正在跳转…
    </div>
  );
}
