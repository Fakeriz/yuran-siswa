"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UsersRound } from "lucide-react";
import { UserBar } from "./user-bar";
import { AppSidebar } from "./app-sidebar";
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

  return (
    <div className="relative min-h-dvh flex flex-col bg-background text-foreground overflow-x-hidden">
      <div className="lg:hidden">
        <UserBar userRole={role} userName={userName} onMenuClick={() => setSidebarOpen((o) => !o)} />
      </div>

      {/* Mobile Drawer (lg:hidden) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[235px] max-w-[85vw] flex-col p-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <AppSidebar
          sections={[{ title: "Menu", items: nav.items }]}
          homeHref={role === "staff" ? "/staff" : "/orangtua"}
          onNavigate={() => setSidebarOpen(false)}
          isActive={(item) => pathname === item.href}
          roleBadge={role === "staff" ? "Staf" : "Orang Tua"}
          subtitle={role === "staff" ? "Dashboard Staf" : "Portal Orang Tua"}
          userName={userName ?? (role === "staff" ? "Staff Demo" : "Orang Tua Demo")}
          userEmail={role === "staff" ? "staff@yuranku.com" : "wali@yuranku.com"}
          userRole={role === "staff" ? "Staf Asrama" : "Orang Tua / Wali"}
          isCollapsed={false}
          onToggleCollapse={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Desktop Floating Sidebar (Persistent, Animated Expand/Collapse) */}
      <div className="fixed top-4 bottom-4 left-4 z-40 hidden lg:flex">
        <AppSidebar
          sections={[{ title: "Menu", items: nav.items }]}
          homeHref={role === "staff" ? "/staff" : "/orangtua"}
          onNavigate={() => {}}
          isActive={(item) => pathname === item.href}
          roleBadge={role === "staff" ? "Staf" : "Orang Tua"}
          subtitle={role === "staff" ? "Dashboard Staf" : "Portal Orang Tua"}
          userName={userName ?? (role === "staff" ? "Staff Demo" : "Orang Tua Demo")}
          userEmail={role === "staff" ? "staff@yuranku.com" : "wali@yuranku.com"}
          userRole={role === "staff" ? "Staf Asrama" : "Orang Tua / Wali"}
          isCollapsed={desktopCollapsed}
          onToggleCollapse={() => setDesktopCollapsed((c) => !c)}
        />
      </div>

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 min-w-0 w-full max-w-full transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${desktopCollapsed ? "lg:pl-[108px]" : "lg:pl-[267px]"}`}>
        <main className="relative flex-1 p-3.5 sm:p-5 lg:pt-4 lg:pb-6 lg:pl-0 lg:pr-4 xl:pr-6 w-full min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
