"use client";

import { useTransition } from "react";
import Link from "next/link";
import { loginDemo, logout } from "../app/(auth)/login/actions";
import type { Role } from "../lib/types";

interface UserBarProps {
  userName?: string;
  userRole: Role;
  title?: string;
}

export function UserBar({ userName, userRole, title = "Yuran Siswa" }: UserBarProps) {
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (role: Role) => {
    if (role === userRole || isPending) return;
    startTransition(async () => {
      await loginDemo(role);
    });
  };

  const handleLogout = () => {
    if (isPending) return;
    startTransition(async () => {
      await logout();
    });
  };

  const roleLabels: Record<Role, string> = {
    admin: "Admin",
    staff: "Staff",
    orang_tua: "Orang Tua",
  };

  const roleColors: Record<Role, string> = {
    admin: "bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800",
    staff: "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
    orang_tua: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
  };

  return (
    <header className="border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#0b1329]/80 sm:px-6">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-3 max-w-7xl">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold tracking-tight text-slate-900 hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300">
            {title}
          </Link>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleColors[userRole]}`}>
            {roleLabels[userRole]}
          </span>
          {userName && (
            <span className="hidden text-xs text-slate-500 sm:inline dark:text-slate-400">
              · {userName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick role switcher for demo */}
          <div className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs dark:border-slate-700 dark:bg-slate-800 md:flex">
            <span className="px-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">Ganti Akun Demo:</span>
            {(["admin", "staff", "orang_tua"] as const).map((r) => (
              <button
                key={r}
                type="button"
                disabled={isPending || userRole === r}
                onClick={() => handleSwitch(r)}
                className={`rounded-lg px-2.5 py-1 font-medium transition ${
                  userRole === r
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                } disabled:cursor-default`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={handleLogout}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white disabled:opacity-50"
          >
            {isPending ? "Keluar…" : "Keluar"}
          </button>
        </div>
      </div>
    </header>
  );
}
