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

export function UserBar({ userName, userRole, title = "YuranKu" }: UserBarProps) {
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
    admin: "bg-purple-100 text-purple-900 border-purple-200",
    staff: "bg-blue-100 text-blue-900 border-blue-200",
    orang_tua: "bg-emerald-100 text-emerald-900 border-emerald-200",
  };

  return (
    <header className="border-b border-border/70 bg-card/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-3 max-w-7xl">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold tracking-tight text-foreground hover:text-primary">
            {title}
          </Link>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleColors[userRole]}`}>
            {roleLabels[userRole]}
          </span>
          {userName && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              · {userName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick role switcher for demo */}
          <div className="hidden items-center rounded-xl border border-border bg-muted p-1 text-xs md:flex">
            <span className="px-2 text-[11px] font-medium text-muted-foreground">Ganti Akun Demo:</span>
            {(["admin", "staff", "orang_tua"] as const).map((r) => (
              <button
                key={r}
                type="button"
                disabled={isPending || userRole === r}
                onClick={() => handleSwitch(r)}
                className={`rounded-lg px-2.5 py-1 font-medium transition ${
                  userRole === r
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
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
            className="rounded-xl border border-input px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
          >
            {isPending ? "Keluar…" : "Keluar"}
          </button>
        </div>
      </div>
    </header>
  );
}
