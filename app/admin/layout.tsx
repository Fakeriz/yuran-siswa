"use client";

import { useState, useEffect, Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  UserCheck,
  Building2,
  Bell,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  ChevronRight,
  School,
  Wallet,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBadge } from "@/components/notification-badge";
import { GlowBackground } from "@/components/glow-background";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Ringkasan",
    items: [
      { name: "Dasbor Utama", href: "/admin", icon: LayoutDashboard },
      { name: "Aliran Kas & Yuran", href: "/admin?tab=aliran-kas", icon: Wallet },
    ],
  },
  {
    title: "Pengurusan (Manage)",
    items: [
      { name: "Data Talebe (Siswa)", href: "/admin?tab=siswa", icon: Users },
      { name: "Transaksi Masuk", href: "/admin?tab=transaksi", icon: CreditCard },
      { name: "Penugasan Staf", href: "/admin?tab=penugasan", icon: Building2 },
      { name: "Pengesahan Ibu Bapa", href: "/admin?tab=persetujuan", icon: UserCheck, badge: "Pending" },
      { name: "Pengurusan Akun", href: "/admin?tab=akun", icon: ShieldCheck },
    ],
  },
  {
    title: "Laporan (Reporting)",
    items: [
      { name: "Resit & Kwitansi", href: "/admin?tab=resit", icon: Receipt },
      { name: "Penyata Bulanan", href: "/admin?tab=penyata", icon: FileSpreadsheet },
    ],
  },
];

function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab"); // null = Dasbor Utama

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
      {navigation.map((section) => (
        <div key={section.title}>
          <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {section.title}
          </h3>
          <div className="mt-2 space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              // Bandingkan tab dari URL dengan tab tujuan link
              const itemTab = item.href.includes("?tab=") ? item.href.split("?tab=")[1] : null;
              const isActive = itemTab === currentTab;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavigate}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600/10 text-blue-800 font-semibold border-l-4 border-blue-600 shadow-2xs dark:bg-blue-500/15 dark:text-blue-300 dark:border-l-4 dark:border-blue-400 dark:shadow-none"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`size-4.5 shrink-0 transition-colors ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 dark:border dark:border-blue-800/50"
                          : "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Breadcrumb() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const names: Record<string, string> = {
    "aliran-kas": "Aliran Kas & Yuran",
    siswa: "Data Talebe",
    transaksi: "Transaksi Masuk",
    penugasan: "Penugasan Staf",
    persetujuan: "Pengesahan Ibu Bapa",
    resit: "Resit & Kwitansi",
    kwitansi: "Resit & Kwitansi",
    penyata: "Penyata Bulanan",
    akun: "Pengurusan Akun",
  };
  const current = tab && names[tab] ? names[tab] : "Dasbor Utama";
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
      <span className="text-slate-800 dark:text-slate-200 font-semibold">YuranKu</span>
      <ChevronRight className="size-3.5 text-slate-400 dark:text-slate-600" />
      <span>Pentadbiran</span>
      <ChevronRight className="size-3.5 text-slate-400 dark:text-slate-600" />
      <span className="text-blue-600 dark:text-blue-400 font-semibold">{current}</span>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sesiOpen, setSesiOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sesi, setSesi] = useState("2026/2027");

  useEffect(() => {
    const saved = localStorage.getItem("yuran-sesi");
    if (saved) setSesi(saved);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Handle ESC key to dismiss drawers/menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setNotifOpen(false);
        setSesiOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [notifs, setNotifs] = useState([
    {
      id: "n-1",
      judul: "Kwitansi perlukan muat naik",
      pesan: "Resit R-2026-1040 (Mohd Rizal) menunggu fail kwitansi rasmi.",
      masa: "10 min lalu",
      dibaca: false,
      tab: "resit",
    },
    {
      id: "n-2",
      judul: "Tuntutan ibu bapa baru",
      pesan: "Hassan bin Abdullah memohon pendaftaran bagi Ahmad bin Ali.",
      masa: "1 jam lalu",
      dibaca: false,
      tab: "persetujuan",
    },
    {
      id: "n-3",
      judul: "Bayaran yuran diterima",
      pesan: "RM 500 diterima daripada Siti Nurhaliza via FPX.",
      masa: "3 jam lalu",
      dibaca: true,
      tab: "transaksi",
    },
  ]);

  const unreadCount = notifs.filter((n) => !n.dibaca).length;
  const SESI_LIST = ["2026/2027", "2025/2026", "2024/2025"];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f7f9fc] text-slate-900 dark:bg-[#0b1329] dark:text-slate-100 transition-colors duration-150 w-full max-w-full overflow-x-hidden">
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation (Desktop Persistent + Mobile Slide Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 dark:bg-[#0b1329] dark:border-slate-800 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo & Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/80">
          <Link href="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5 group focus-visible:outline-blue-600">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-all">
              <School className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-slate-900 tracking-tight dark:text-slate-100">YuranKu</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium dark:text-slate-400">Aylik Talebe Management</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
            aria-label="Tutup navigasi"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <Suspense>
          <SidebarNav onNavigate={() => setSidebarOpen(false)} />
        </Suspense>

        {/* User Profile Card & Sign Out */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 rounded-xl p-2.5 border border-slate-200/70 bg-white/80 shadow-2xs dark:bg-slate-800/60 dark:border-slate-700">
            <div className="size-9 rounded-full bg-blue-600/10 text-blue-700 font-semibold flex items-center justify-center shrink-0 border border-blue-200/70 text-xs dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-800/50">
              TU
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate dark:text-slate-100">Pegawai Tata Usaha</p>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 dark:text-slate-400">
                <ShieldCheck className="size-3 text-emerald-500 shrink-0 dark:text-emerald-400" />
                Pentadbir Sistem
              </p>
            </div>
            <Link
              href="/login"
              title="Keluar / Log Masuk Semula"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors dark:text-slate-500 dark:hover:text-rose-400"
            >
              <LogOut className="size-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0 w-full max-w-full overflow-x-hidden">
        {/* Dedicated Mobile Header (lg:hidden) */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/70 bg-white/85 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#0b1329]/85 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl focus-visible:outline-blue-600 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800/80"
              aria-label="Buka menu navigasi"
            >
              <Menu className="size-5" />
            </button>
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <School className="size-4" />
              </div>
              <span className="font-bold text-base text-slate-900 tracking-tight dark:text-slate-100">YuranKu</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60">
                Admin
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              aria-label={`Pemberitahuan sistem${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
            >
              <Bell className="size-4.5" />
              <NotificationBadge count={unreadCount} />
            </button>
          </div>
        </header>

        {/* Desktop Top Navbar (hidden on mobile, visible on lg) */}
        <header className="sticky top-0 z-30 hidden lg:flex h-16 w-full items-center justify-between border-b border-slate-200/70 bg-white/85 backdrop-blur-md px-6 lg:px-8 dark:border-slate-800 dark:bg-[#0b1329]/85">
          <div className="flex items-center gap-3">
            <Suspense>
              <Breadcrumb />
            </Suspense>
          </div>

          {/* Topbar Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Pemilih Sesi Persekolahan */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setSesiOpen((o) => !o); setNotifOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
              >
                <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Sesi Persekolahan {sesi}</span>
              </button>
              {sesiOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg z-50 dark:border-slate-800 dark:bg-[#0b1329]">
                  {SESI_LIST.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSesi(s);
                        localStorage.setItem("yuran-sesi", s);
                        setSesiOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl dark:hover:bg-slate-800 ${
                        s === sesi
                          ? "text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Sesi {s}{s === sesi && " ✓"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tombol Theme Toggle */}
            <ThemeToggle />

            {/* Notifikasi Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setNotifOpen((o) => !o); setSesiOpen(false); }}
                className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                aria-label={`Pemberitahuan sistem${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
              >
                <Bell className="size-4.5" />
                <NotificationBadge count={unreadCount} />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden dark:border-slate-800 dark:bg-[#0b1329]">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifikasi</p>
                    <button
                      type="button"
                      onClick={() => setNotifs((ns) => ns.map((n) => ({ ...n, dibaca: true })))}
                      className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-300"
                    >
                      Tandai semua dibaca
                    </button>
                  </div>
                  <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifs.map((n) => (
                      <li key={n.id}>
                        <Link
                          href={`/admin?tab=${n.tab}`}
                          onClick={() => {
                            setNotifs((ns) => ns.map((x) => x.id === n.id ? { ...x, dibaca: true } : x));
                            setNotifOpen(false);
                          }}
                          className={`block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                            !n.dibaca ? "bg-blue-50/60 dark:bg-blue-950/30" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.judul}</p>
                            {!n.dibaca && <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-600" />}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{n.pesan}</p>
                          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">{n.masa}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Link
              href="/admin?tab=resit"
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)] transition-all hover:bg-black active:scale-[0.98] focus-visible:outline-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <CreditCard className="size-3.5" />
              <span>Kwitansi & Bayaran</span>
            </Link>
          </div>
        </header>

        {/* Mobile Notification Popover Drawer (when open on mobile) */}
        {notifOpen && (
          <div className="fixed inset-x-3 top-18 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-[#0b1329] lg:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifikasi</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNotifs((ns) => ns.map((n) => ({ ...n, dibaca: true })))}
                  className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-300"
                >
                  Tandai semua
                </button>
                <button
                  type="button"
                  onClick={() => setNotifOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg dark:hover:text-slate-200"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifs.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/admin?tab=${n.tab}`}
                    onClick={() => {
                      setNotifs((ns) => ns.map((x) => x.id === n.id ? { ...x, dibaca: true } : x));
                      setNotifOpen(false);
                    }}
                    className={`block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      !n.dibaca ? "bg-blue-50/60 dark:bg-blue-950/30" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.judul}</p>
                      {!n.dibaca && <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-600" />}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{n.pesan}</p>
                    <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">{n.masa}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Page Children Container */}
        <main className="relative flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full min-w-0 mx-auto overflow-x-hidden">
          <GlowBackground />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
