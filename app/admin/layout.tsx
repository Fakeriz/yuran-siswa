"use client";

import { useState, useEffect, useRef, Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  ChevronDown,
  CircleHelp,
  School,
  Search,
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
      { name: "Arus Kas & Yuran", href: "/admin?tab=aliran-kas", icon: Wallet },
    ],
  },
  {
    title: "Pengurusan (Manage)",
    items: [
      { name: "Data Siswa", href: "/admin?tab=siswa", icon: Users },
      { name: "Transaksi Masuk", href: "/admin?tab=transaksi", icon: CreditCard },
      { name: "Penugasan Staf", href: "/admin?tab=penugasan", icon: Building2 },
      { name: "Persetujuan Orang Tua", href: "/admin?tab=persetujuan", icon: UserCheck, badge: "Pending" },
      { name: "Pengelolaan Akun", href: "/admin?tab=akun", icon: ShieldCheck },
    ],
  },
  {
    title: "Laporan (Reporting)",
    items: [
      { name: "Kuitansi", href: "/admin?tab=resit", icon: Receipt },
      { name: "Laporan Bulanan", href: "/admin?tab=penyata", icon: FileSpreadsheet },
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

const TAB_NAMES: Record<string, string> = {
  "aliran-kas": "Arus Kas & Yuran",
  siswa: "Data Siswa",
  transaksi: "Transaksi Masuk",
  penugasan: "Penugasan Staf",
  persetujuan: "Persetujuan Orang Tua",
  resit: "Kuitansi",
  kwitansi: "Kuitansi",
  penyata: "Laporan Bulanan",
  akun: "Pengelolaan Akun",
};

function tabTitle(tab: string | null): string {
  return tab && TAB_NAMES[tab] ? TAB_NAMES[tab] : "Dasbor Utama";
}

/** Tajuk tab semasa untuk bar header atas (gaya financial dashboard). */
function HeaderTitle() {
  const searchParams = useSearchParams();
  return (
    <h1 className="shrink-0 truncate text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
      {tabTitle(searchParams.get("tab"))}
    </h1>
  );
}

function Breadcrumb() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const current = tabTitle(tab);
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
      <span className="text-slate-800 dark:text-slate-200 font-semibold">YuranKu</span>
      <ChevronRight className="size-3.5 text-slate-400 dark:text-slate-600" />
      <span>Administrasi</span>
      <ChevronRight className="size-3.5 text-slate-400 dark:text-slate-600" />
      <span className="text-blue-600 dark:text-blue-400 font-semibold">{current}</span>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [sesi, setSesi] = useState("2026/2027");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
        setHelpOpen(false);
        setUserOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [notifs, setNotifs] = useState([
    {
      id: "n-1",
      judul: "Kuitansi perlu diunggah",
      pesan: "Kuitansi R-2026-1040 (Mohd Rizal) menunggu file kuitansi resmi.",
      masa: "10 min lalu",
      dibaca: false,
      tab: "resit",
    },
    {
      id: "n-2",
      judul: "Pengajuan orang tua baru",
      pesan: "Hassan bin Abdullah mengajukan pendaftaran untuk Ahmad bin Ali.",
      masa: "1 jam lalu",
      dibaca: false,
      tab: "persetujuan",
    },
    {
      id: "n-3",
      judul: "Pembayaran yuran diterima",
      pesan: "RM 500 diterima dari Siti Nurhaliza via FPX.",
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
              <p className="text-[11px] text-slate-500 font-medium dark:text-slate-400">Manajemen Yuran Bulanan</p>
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
                Administrator Sistem
              </p>
            </div>
            <Link
              href="/login"
              title="Keluar / Masuk Kembali"
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
              aria-label={`Notifikasi sistem${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
            >
              <Bell className="size-4.5" />
              <NotificationBadge count={unreadCount} />
            </button>
          </div>
        </header>

        {/* Desktop Top Navbar — bar terapung gaya financial dashboard */}
        <header className="sticky top-0 z-30 hidden w-full px-6 pt-4 lg:block lg:px-8">
          <div className="flex h-16 w-full items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/90 px-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)] backdrop-blur-md dark:border-slate-800 dark:bg-[#0b1329]/90">
            {/* Tajuk tab semasa */}
            <Suspense>
              <HeaderTitle />
            </Suspense>

            {/* Carian global */}
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchRef.current?.value.trim();
                if (q) router.push(`/admin?tab=siswa&q=${encodeURIComponent(q)}`);
              }}
              className="relative hidden w-full max-w-md md:block"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                ref={searchRef}
                type="search"
                placeholder="Cari apa saja..."
                aria-label="Cari siswa atau transaksi"
                className="h-11 w-full rounded-full border border-transparent bg-slate-100/80 pl-11 pr-16 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:outline-none dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-violet-700 dark:focus:bg-slate-900 [&::-webkit-search-cancel-button]:hidden"
              />
              <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
                ⌘K
              </kbd>
            </form>

            {/* Kluster kanan */}
            <div className="flex shrink-0 items-center gap-1">
              <ThemeToggle />

              {/* Bantuan */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setHelpOpen((o) => !o); setNotifOpen(false); setUserOpen(false); }}
                  className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  aria-label="Bantuan"
                  aria-expanded={helpOpen}
                >
                  <CircleHelp className="size-[18px]" />
                </button>
                {helpOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-[#0b1329]">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Bantuan pantas</p>
                    <ul className="mt-2 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                      <li className="flex items-center justify-between gap-2">
                        <span>Fokus ke carian</span>
                        <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold dark:border-slate-700 dark:bg-slate-800">⌘K</kbd>
                      </li>
                      <li>Carian akan membuka tab Data Siswa dengan kata kunci Anda.</li>
                      <li>Klik ikon loceng untuk melihat notifikasi sistem terkini.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Notifikasi */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setNotifOpen((o) => !o); setHelpOpen(false); setUserOpen(false); }}
                  className="relative rounded-full p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  aria-label={`Notifikasi sistem${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
                >
                  <Bell className="size-[18px]" />
                  <NotificationBadge count={unreadCount} />
                </button>
                {notifOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#0b1329]">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifikasi</p>
                      <button
                        type="button"
                        onClick={() => setNotifs((ns) => ns.map((n) => ({ ...n, dibaca: true })))}
                        className="text-xs font-medium text-blue-700 hover:underline dark:text-blue-300"
                      >
                        Tandai semua dibaca
                      </button>
                    </div>
                    <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
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

              {/* Chip pengguna */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); setHelpOpen(false); }}
                  className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Menu akun"
                  aria-expanded={userOpen}
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white shadow-md" aria-hidden>
                    AD
                  </span>
                  <span className="hidden text-left xl:block">
                    <span className="block max-w-32 truncate text-xs font-semibold text-slate-900 dark:text-slate-100">Administrator Demo</span>
                    <span className="block text-[10px] text-slate-400">@admin</span>
                  </span>
                  <ChevronDown className="size-4 text-slate-400" aria-hidden />
                </button>
                {userOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-[#0b1329]">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white" aria-hidden>
                        AD
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">Administrator Demo</p>
                        <p className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <ShieldCheck className="size-3 shrink-0 text-emerald-500 dark:text-emerald-400" />
                          Administrator Sistem
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tahun Ajaran</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {SESI_LIST.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => { setSesi(s); localStorage.setItem("yuran-sesi", s); }}
                            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                              s === sesi
                                ? "bg-violet-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Link
                      href="/login"
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <LogOut className="size-3.5" aria-hidden />
                      Keluar / Masuk Kembali
                    </Link>
                  </div>
                )}
              </div>
            </div>
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
