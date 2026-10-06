"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UsersRound, ReceiptText, X, School } from "lucide-react";
import { UserBar } from "./user-bar";
import { AppSidebar } from "./app-sidebar";
import { DashboardHeader } from "./dashboard-header";
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
    <AppSidebar
      sections={[{ title: "Menu", items: nav.items }]}
      homeHref={role === "staff" ? "/staff" : "/orangtua"}
      onNavigate={onNavigate}
      isActive={(item) => pathname === item.href}
      roleBadge={role === "staff" ? "Staf" : "Orang Tua"}
      subtitle={role === "staff" ? "Dashboard Staf" : "Portal Orang Tua"}
    />
  );

  return (
    <div className="relative min-h-dvh flex flex-col bg-background text-foreground">
      <div className="lg:hidden">
        <UserBar userRole={role} userName={userName} onMenuClick={() => setSidebarOpen((o) => !o)} />
      </div>
      <DashboardHeader
        title={role === "staff" ? "Dashboard Staf" : "Dashboard"}
        titleIcon={
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
            <School className="size-4" />
          </span>
        }
        userName={userName ?? (role === "staff" ? "Staff Demo" : "Orang Tua Demo")}
        userHandle={role === "staff" ? "staff" : "orangtua"}
        userInitials={role === "staff" ? "ST" : "OT"}
        searchPlaceholder={role === "staff" ? "Cari siswa..." : "Cari..."}
        onSearch={(q) => {
          // TODO: implementasi search per role
          console.log("Search:", q);
        }}
        onCollapseSidebar={() => setDesktopCollapsed((c) => !c)}
        collapseIcon={<LayoutDashboard className="size-4" />}
      />

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
