"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOut, ReceiptText } from "lucide-react";
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
    staff: "Staf",
    orang_tua: "Orang Tua",
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-5">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ReceiptText className="size-4" aria-hidden="true" />
            </span>
            <span className="font-bold tracking-tight text-foreground">
              {title}
            </span>
          </Link>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
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
          <div className="hidden items-center rounded-full border border-border bg-card p-1 text-xs md:flex">
            <span className="px-3 text-[11px] font-medium text-muted-foreground">Ganti Akun Demo:</span>
            {(["admin", "staff", "orang_tua"] as const).map((r) => (
              <button
                key={r}
                type="button"
                disabled={isPending || userRole === r}
                onClick={() => handleSwitch(r)}
                className={`rounded-full px-3 py-1.5 font-medium transition ${
                  userRole === r
                    ? "bg-primary text-primary-foreground"
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
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            {isPending ? "Keluar…" : "Keluar"}
          </button>
        </div>
      </div>
    </header>
  );
}
