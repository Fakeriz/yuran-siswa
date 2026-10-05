"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOut, Menu, ReceiptText } from "lucide-react";
import { loginDemo, logout } from "../app/(auth)/login/actions";
import { ThemeToggle } from "./theme-toggle";
import type { Role } from "../lib/types";

interface UserBarProps {
  userName?: string;
  userRole: Role;
  onMenuClick?: () => void;
  title?: string; // deprecated, tidak dipakai lagi
}

export function UserBar({ userName, userRole, onMenuClick }: UserBarProps) {
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

  const homeHref = userRole === "admin" ? "/admin" : userRole === "staff" ? "/staff" : "/orangtua";

  return (
    <>
      {/* Mobile header — ikut pola admin */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/70 bg-background/80 p-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl focus-visible:outline-primary" aria-label="Buka menu navigasi"
          >
            <Menu className="size-5" />
          </button>
          <Link href={homeHref} className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
              <ReceiptText className="size-4" aria-hidden="true" />
            </span>
            <span className="font-bold text-base text-foreground tracking-tight">YuranKu</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">
              {roleLabels[userRole]}
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button type="button" disabled={isPending} onClick={handleLogout}
            className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground transition-colors" aria-label="Keluar"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Desktop header — floating card ikut pola admin */}
      <header className="sticky top-0 z-30 hidden w-full px-6 pt-4 lg:block lg:px-8">
        <div className="flex h-16 w-full items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card px-5">
          <div className="flex items-center gap-3">
            <Link href={homeHref} className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
                <ReceiptText className="size-4" aria-hidden="true" />
              </span>
              <span className="font-bold text-base text-foreground tracking-tight">YuranKu</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">
                {roleLabels[userRole]}
              </span>
            </Link>
            {userName && (
              <span className="hidden text-xs text-muted-foreground xl:inline">
                · {userName}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <div className="hidden items-center rounded-full border border-border bg-muted/60 p-1 text-xs xl:flex">
              <span className="px-3 text-[11px] font-medium text-muted-foreground">Ganti Akun Demo:</span>
              {(["admin", "staff", "orang_tua"] as const).map((r) => (
                <button key={r} type="button" disabled={isPending || userRole === r} onClick={() => handleSwitch(r)}
                  className={`rounded-full px-3 py-1.5 font-medium transition ${userRole === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"} disabled:cursor-default`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
            <ThemeToggle />
            <button type="button" disabled={isPending} onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground shadow-2xs transition hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              {isPending ? "Keluar…" : "Keluar"}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
