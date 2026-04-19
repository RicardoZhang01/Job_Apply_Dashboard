"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";

const links = [
  { href: "/dashboard", label: "仪表盘" },
  { href: "/board", label: "看板" },
  { href: "/list", label: "列表" },
  { href: "/reminders", label: "提醒" },
  { href: "/stats", label: "统计" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    qc.removeQueries({ queryKey: ["me"] });
    router.replace("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-semibold text-slate-900">
            求职看板
          </Link>
          <nav className="flex gap-4 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  pathname === l.href
                    ? "font-medium text-indigo-600"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/applications/new/quick"
            className="rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-indigo-700 hover:bg-indigo-50"
          >
            极简新建
          </Link>
          <Link
            href="/applications/new"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700"
          >
            新建申请
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-slate-600 hover:text-slate-900"
          >
            退出
          </button>
        </div>
      </div>
    </header>
  );
}
