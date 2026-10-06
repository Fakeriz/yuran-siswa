"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UsersRound, ReceiptText, X } from "lucide-react";
import { UserBar } from "./user-bar";
import type { Role } from "../lib/types";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const NAVS: Record<Exclude<Role, "admin">, { title: string; items: NavItem[] }> = {
  staff: {
    title: "YuranKu · Dashboard Staf",
    items: [
      { name: "Dashboard Staf", href: "/staff", icon: LayoutDashboard },
      { name: "Pilih Grup", href: "/staff/grup", icon: UsersRound },
    ],
  },
  orang_tua: {
    title: "YuranKu · Portal Orang Tua",
    items: [
      { name: "Dashboard", href: "/orangtua", icon: LayoutDashboard },
    ],
  },
};

export function RoleLayout({ role, userName, children }: { role: Exclude<Role, "admin">; userName?: string; children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const pathname = usePathname();
  const nav = NAVS[role];

  const sidebarContent = (onNavigate: () => void) => (
    <>
      <div className="flex h-16 items-center justify-between px-5 border-b border-border">
        <Link href={role === "staff" ? "/staff" : "/orangtua"} onClick={onNavigate} className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-md">
            <ReceiptText className="size-4.5" />
          </span>
          <span className="font-bold text-base text-foreground tracking-tight">YuranKu</span>
        </Link>
        <button type="button" onClick={onNavigate}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors" aria-label="Tutup navigasi"
        >
          <X className="size-5" />
        </button>
      </div>
      <nav aria-label={`Menu ${role}`} className="flex-1 overflow-y-auto p-4">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Menu</p>
        <div className="mt-2 space-y-1">
          {nav.items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-primary font-semibold text-primary-foreground shadow-sm" : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );

  return (
    <div className="relative min-h-dvh flex flex-col bg-background text-foreground">
      <UserBar userRole={role} userName={userName} onMenuClick={() => {
        if (window.innerWidth >= 1024) setDesktopCollapsed((c) => !c);
        else setSidebarOpen((o) => !o);
      }} />

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-hidden border border-border/70 bg-background pt-[env(safe-area-inset-top,0px)] shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent(() => setSidebarOpen(false))}
      </aside>

      {/* Desktop layout */}
      <div className={`relative flex-1 lg:gap-6 lg:p-6 lg:pt-2 ${desktopCollapsed ? "lg:block" : "lg:grid lg:grid-cols-[240px_minmax(0,1fr)]"}`}>
        <aside className={`hidden lg:flex lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-4 flex-col overflow-hidden ${desktopCollapsed ? "lg:hidden" : ""}`}>
          {sidebarContent(() => {})}
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-2 lg:py-2">
          {children}
        </main>
      </div>
    </div>
  );
}
