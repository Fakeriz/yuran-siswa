"use client";

import { useState, useEffect, Suspense, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  UsersRound,
  AlertCircle,
  CreditCard,
  Receipt,
  Bell,
  X,
} from "lucide-react";
import { UserBar } from "./user-bar";
import { AppSidebar, type SidebarNotification, type SidebarSection } from "./app-sidebar";
import { NotificationBadge } from "./notification-badge";
import { logout } from "../app/(auth)/login/actions";
import type { Role } from "../lib/types";

const STAFF_NAVIGATION: SidebarSection[] = [
  {
    items: [
      { name: "Dasbor Staf", href: "/staff", icon: LayoutDashboard },
      { name: "Siswa Belum Bayar", href: "/staff?filter=belum", icon: AlertCircle },
      { name: "Pilih Grup Bimbingan", href: "/staff/grup", icon: UsersRound },
    ],
  },
];

const ORANG_TUA_NAVIGATION: SidebarSection[] = [
  {
    items: [
      { name: "Dasbor Yuran Anak", href: "/orangtua", icon: LayoutDashboard },
    ],
  },
];

const STAFF_INITIAL_NOTIFS: SidebarNotification[] = [
  {
    id: "s1",
    judul: "Pembayaran Yuran Siswa",
    pesan: "Pembayaran yuran Adhwa HE (RM 250.00) telah disahkan dan dicatat.",
    masa: "10 menit lalu",
    dibaca: false,
    href: "/staff",
  },
  {
    id: "s2",
    judul: "Peringatan Tunggakan",
    pesan: "3 siswa dalam grup asrama Anda belum melunasi yuran bulan ini.",
    masa: "1 jam lalu",
    dibaca: false,
    href: "/staff?filter=belum",
  },
  {
    id: "s3",
    judul: "Kuitansi Siap Diunduh",
    pesan: "Kuitansi yuran bulan Oktober telah diunggah ke Google Drive.",
    masa: "3 jam lalu",
    dibaca: false,
    href: "/staff",
  },
  {
    id: "s4",
    judul: "Penugasan Grup Bimbingan",
    pesan: "Daftar grup asrama Sesi 2026/2027 telah diperbarui oleh Admin.",
    masa: "Kemarin",
    dibaca: true,
    href: "/staff/grup",
  },
];

const ORANG_TUA_INITIAL_NOTIFS: SidebarNotification[] = [
  {
    id: "o1",
    judul: "Persetujuan Akun Disahkan",
    pesan: "Hubungan akun wali murid Anda dengan Talebe telah disetujui Admin.",
    masa: "5 menit lalu",
    dibaca: false,
    href: "/orangtua",
  },
  {
    id: "o2",
    judul: "Tagihan Yuran Oktober 2026",
    pesan: "Tagihan yuran bulanan RM 250.00 telah diterbitkan untuk anak Anda.",
    masa: "1 jam lalu",
    dibaca: false,
    href: "/orangtua",
  },
  {
    id: "o3",
    judul: "Kuitansi Resmi Tersedia",
    pesan: "Kuitansi pembayaran yuran telah diunggah dan dapat dilihat langsung.",
    masa: "4 jam lalu",
    dibaca: false,
    href: "/orangtua",
  },
  {
    id: "o4",
    judul: "Peringatan Batas Bayar",
    pesan: "Harap selesaikan pembayaran yuran sebelum tanggal 25 bulan ini.",
    masa: "Kemarin",
    dibaca: true,
    href: "/orangtua",
  },
];

export function RoleLayout({
  role,
  userName,
  children,
}: {
  role: Exclude<Role, "admin">;
  userName?: string;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const [notifs, setNotifs] = useState<SidebarNotification[]>(() =>
    role === "staff" ? STAFF_INITIAL_NOTIFS : ORANG_TUA_INITIAL_NOTIFS
  );
  const unreadCount = notifs.filter((n) => !n.dibaca).length;

  const [isPending, startTransition] = useTransition();
  const handleLogout = () => {
    if (isPending) return;
    startTransition(async () => {
      await logout();
    });
  };

  const displayName = userName ?? (role === "staff" ? "Ust. Ahmad Dahlan" : "Ibu Siti Rahmah");
  const userEmail = role === "staff" ? "staff@yuranku.com" : "wali@yuranku.com";
  const userInitials = role === "staff" ? "AD" : "SR";
  const userRoleLabel = role === "staff" ? "Staf Asrama" : "Orang Tua / Wali";
  const roleBadge = role === "staff" ? "Staf" : "Orang Tua";
  const homeHref = role === "staff" ? "/staff" : "/orangtua";
  const sections = role === "staff" ? STAFF_NAVIGATION : ORANG_TUA_NAVIGATION;

  const checkIsActive = (item: { href: string }) => {
    if (item.href === pathname) {
      if (!item.href.includes("?") && !searchParams?.toString()) return true;
    }
    if (item.href.includes("?")) {
      const [path, query] = item.href.split("?");
      if (pathname === path) {
        const params = new URLSearchParams(query);
        let allMatch = true;
        params.forEach((val, key) => {
          if (searchParams?.get(key) !== val) allMatch = false;
        });
        return allMatch;
      }
    }
    return item.href === homeHref && pathname === homeHref && !searchParams?.get("filter");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-150 w-full max-w-full overflow-x-hidden">
      {/* Desktop Floating Sidebar (Persistent, Animated Expand/Collapse) */}
      <div className="fixed top-4 bottom-4 left-4 z-40 hidden lg:flex">
        <Suspense>
          <AppSidebar
            sections={sections}
            homeHref={homeHref}
            appName="YuranKu"
            subtitle="Enterprise"
            roleBadge={roleBadge}
            userName={displayName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={userRoleLabel}
            isCollapsed={desktopCollapsed}
            onToggleCollapse={() => setDesktopCollapsed((c) => !c)}
            isActive={checkIsActive}
            searchable
            searchPlaceholder="Search..."
            onLogout={handleLogout}
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
                  sections={sections}
                  homeHref={homeHref}
                  appName="YuranKu"
                  subtitle="Enterprise"
                  roleBadge={roleBadge}
                  userName={displayName}
                  userEmail={userEmail}
                  userInitials={userInitials}
                  userRole={userRoleLabel}
                  isCollapsed={false}
                  onToggleCollapse={() => setSidebarOpen(false)}
                  onNavigate={() => setSidebarOpen(false)}
                  isActive={checkIsActive}
                  searchable
                  searchPlaceholder="Search..."
                  onLogout={handleLogout}
                />
              </Suspense>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 min-w-0 w-full max-w-full transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          desktopCollapsed ? "lg:pl-[108px]" : "lg:pl-[267px]"
        }`}
      >
        {/* Mobile Header — pakai UserBar bersama (desktop disembunyikan) */}
        <div className="lg:hidden">
          <UserBar
            userRole={role}
            userName={displayName}
            onMenuClick={() => setSidebarOpen((o) => !o)}
            actions={
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground transition-colors"
                aria-label={`Notifikasi sistem${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
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
                <button
                  type="button"
                  onClick={() => setNotifs((ns) => ns.map((n) => ({ ...n, dibaca: true })))}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Tandai semua
                </button>
                <button
                  type="button"
                  onClick={() => setNotifOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <ul className="max-h-72 overflow-y-auto divide-y divide-border">
              {notifs.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href ?? homeHref}
                    onClick={() => {
                      setNotifs((ns) => ns.map((x) => (x.id === n.id ? { ...x, dibaca: true } : x)));
                      setNotifOpen(false);
                    }}
                    className={`block px-4 py-3 hover:bg-accent transition-colors ${
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
