"use client";

import { useState, useEffect, Suspense, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Building2,
  Receipt,
  UserCheck,
  ShieldCheck,
  LayoutDashboard,
  Bell,
  X,
} from "lucide-react";
import { UserBar } from "@/components/user-bar";
import { AppSidebar, type SidebarSection } from "@/components/app-sidebar";
import { NotificationBadge } from "@/components/notification-badge";

const navigation: SidebarSection[] = [
  {
    items: [
      { name: "Dasbor Utama", href: "/admin", icon: LayoutDashboard },
      { name: "Data Siswa", href: "/admin?tab=siswa", icon: Users },
      { name: "Kuitansi", href: "/admin?tab=kwitansi", icon: Receipt },
      { name: "Penugasan Staf", href: "/admin?tab=penugasan", icon: Building2 },
      { name: "Persetujuan Orang Tua", href: "/admin?tab=persetujuan", icon: UserCheck },
      { name: "Pengelolaan Akun", href: "/admin?tab=akun", icon: ShieldCheck },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sesi, setSesi] = useState("2026/2027");

  // Handle ESC key to dismiss drawers/menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [notifs, setNotifs] = useState<Array<{
    id: string;
    judul: string;
    pesan: string;
    masa: string;
    dibaca: boolean;
    tab: string;
  }>>([]);

  const unreadCount = notifs.filter((n) => !n.dibaca).length;
  const SESI_LIST = ["2026/2027", "2025/2026", "2024/2025"];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-150 w-full max-w-full overflow-x-hidden">
      {/* Desktop Floating Sidebar (Persistent, Animated Expand/Collapse) */}
      <div className="fixed top-4 bottom-4 left-4 z-40 hidden lg:flex">
        <Suspense>
          <AppSidebar
            sections={navigation}
            homeHref="/admin"
            appName="YuranKu"
            subtitle="Enterprise"
            roleBadge="Admin"
            userName="Sarah Johnson"
            userEmail="sarah@acme.com"
            userInitials="SJ"
            userRole="Administrator"
            isCollapsed={desktopCollapsed}
            onToggleCollapse={() => setDesktopCollapsed((c) => !c)}
            isActive={(item) => {
              const tab = item.href.includes("?tab=") ? item.href.split("?tab=")[1] : null;
              return tab === currentTab || (!tab && !currentTab && item.href === "/admin");
            }}
            searchable
            searchPlaceholder="Search..."
          />
        </Suspense>
      </div>

      {/* Mobile Sidebar Overlay & Drawer (lg:hidden) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[235px] max-w-[85vw] flex-col p-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] lg:hidden"
            >
              <Suspense>
                <AppSidebar
                  sections={navigation}
                  homeHref="/admin"
                  appName="YuranKu"
                  subtitle="Enterprise"
                  roleBadge="Admin"
                  userName="Sarah Johnson"
                  userEmail="sarah@acme.com"
                  userInitials="SJ"
                  userRole="Administrator"
                  isCollapsed={false}
                  onToggleCollapse={() => setSidebarOpen(false)}
                  onNavigate={() => setSidebarOpen(false)}
                  isActive={(item) => {
                    const tab = item.href.includes("?tab=") ? item.href.split("?tab=")[1] : null;
                    return tab === currentTab || (!tab && !currentTab && item.href === "/admin");
                  }}
                  searchable
                  footerExtra={
                    <div className="p-3 border-t border-border bg-muted/40">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">Sesi Persekolahan</p>
                      <div className="flex gap-1.5">
                        {SESI_LIST.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSesi(s)}
                            className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
                              sesi === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  }
                />
              </Suspense>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 min-w-0 w-full max-w-full transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${desktopCollapsed ? "lg:pl-[108px]" : "lg:pl-[267px]"}`}>
        {/* Mobile Header — pakai UserBar bersama (desktop disembunyikan) */}
        <div className="lg:hidden">
          <UserBar
            userRole="admin"
            userName="Administrator"
            onMenuClick={() => setSidebarOpen((o) => !o)}
            actions={
              <button type="button" onClick={() => setNotifOpen((o) => !o)}
                className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground transition-colors" aria-label={`Notifikasi sistem${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
              >
                <Bell className="size-4.5" />
                <NotificationBadge count={unreadCount} />
              </button>
            }
          />
        </div>

        {/* Mobile Notification Popover Drawer (when open on mobile) */}
        {notifOpen && (
          <div className="fixed inset-x-3 top-18 z-50 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden lg:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-bold text-foreground">Notifikasi</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setNotifs((ns) => ns.map((n) => ({ ...n, dibaca: true })))}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Tandai semua
                </button>
                <button type="button" onClick={() => setNotifOpen(false)}
                  className="p-1 text-muted-foreground hover:text-muted-foreground rounded-lg"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <ul className="max-h-72 overflow-y-auto divide-y divide-border">
              {notifs.map((n) => (
                <li key={n.id}>
                  <Link href={`/admin?tab=${n.tab}`}
                    onClick={() => {
                      setNotifs((ns) => ns.map((x) => x.id === n.id ? { ...x, dibaca: true } : x));
                      setNotifOpen(false);
                    }}
                    className={`block px-4 py-3 hover:bg-accent ${
                      !n.dibaca ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">{n.judul}</p>
                      {!n.dibaca && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.pesan}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{n.masa}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Page Children Container — Jarak sejajar & selaras dengan kad sidebar */}
        <main className="relative flex-1 p-3.5 sm:p-5 lg:pt-4 lg:pb-6 lg:pl-0 lg:pr-4 xl:pr-6 w-full min-w-0 overflow-x-hidden">
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
