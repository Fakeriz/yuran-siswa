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
    ],
  },
  {
    title: "Pengurusan",
    items: [
      { name: "Data Siswa", href: "/admin?tab=siswa", icon: Users },
      { name: "Transaksi Masuk", href: "/admin?tab=transaksi", icon: CreditCard },
      { name: "Penugasan Staf", href: "/admin?tab=penugasan", icon: Building2 },
      { name: "Persetujuan Orang Tua", href: "/admin?tab=persetujuan", icon: UserCheck, badge: "Pending" },
      { name: "Pengelolaan Akun", href: "/admin?tab=akun", icon: ShieldCheck },
    ],
  },
  {
    title: "Laporan",
    items: [
      { name: "Kuitansi", href: "/admin?tab=resit", icon: Receipt },
      { name: "Laporan Bulanan", href: "/admin?tab=penyata", icon: FileSpreadsheet },
    ],
  },
];

function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null; // null = Dasbor Utama
  const [menuQuery, setMenuQuery] = useState("");

  const q = menuQuery.trim().toLowerCase();
  const visibleSections = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !q || item.name.toLowerCase().includes(q)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="flex flex-1 min-h-0 flex-col px-4 pb-4">
      {/* Carian menu */}
      <div className="px-1 pb-3 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input type="search" value={menuQuery}
            onChange={(e) => setMenuQuery(e.target.value)}
            placeholder="Cari menu" aria-label="Cari menu navigasi" className="h-10 w-full rounded-xl border border-transparent bg-muted/80 pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-1 py-1">
        {visibleSections.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">Tiada menu sepadan.</p>
        ) : (
          visibleSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 text-xs font-medium text-muted-foreground">
                {section.title}
              </h3>
              <div className="mt-1.5 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const itemTab = item.href.includes("?tab=") ? item.href.split("?tab=")[1] : null;
                  const isActive = itemTab === currentTab;

                  return (
                    <Link key={item.name}
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-primary/10 font-semibold text-primary"
                          : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon className={`size-[18px] shrink-0 transition-colors ${
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-muted-foreground"
                          }`}
                          aria-hidden
                        />
                        <span className="truncate">{item.name}</span>
                      </span>
                      {item.badge && (
                        <span className="ml-2 shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const TAB_NAMES: Record<string, string> = {
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
    <h1 className="shrink-0 truncate text-lg font-bold tracking-tight text-foreground">
      {tabTitle(searchParams ? searchParams.get("tab") : null)}
    </h1>
  );
}

function Breadcrumb() {
  const searchParams = useSearchParams();
  const tab = searchParams ? searchParams.get("tab") : null;
  const current = tabTitle(tab);
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium">
      <span className="text-foreground font-semibold">YuranKu</span>
      <ChevronRight className="size-3.5 text-muted-foreground" />
      <span>Administrasi</span>
      <ChevronRight className="size-3.5 text-muted-foreground" />
      <span className="text-primary font-semibold">{current}</span>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground transition-colors duration-150 w-full max-w-full overflow-x-hidden">
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation (Desktop Persistent + Mobile Slide Drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-hidden border border-border/70 bg-background shadow-xl lg:bg-card/95 lg:shadow-none transition-transform duration-300 ease-in-out lg:bottom-4 lg:left-4 lg:top-4 lg:rounded-3xl ${desktopCollapsed ? "lg:-translate-x-[110%]" : "lg:translate-x-0"}  ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo & Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-border">
          <button type="button" onClick={() => { if (window.innerWidth >= 1024) setDesktopCollapsed((c) => !c); else setSidebarOpen(false); }} className="flex items-center gap-2.5 group focus-visible:outline-primary" aria-label="Buka/tutup navigasi">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-md transition-all">
              <School className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-foreground tracking-tight">YuranKu</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Manajemen Yuran Bulanan</p>
            </div>
          </button>

          <button type="button" onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors" aria-label="Tutup navigasi"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <Suspense>
          <SidebarNav onNavigate={() => setSidebarOpen(false)} />
        </Suspense>

        {/* User Profile Card & Sign Out — hanya dalam drawer mobile (desktop: sudah ada chip pengguna di bar atas) */}
        <div className="p-3.5 border-t border-border bg-muted/50 lg:hidden">
          <div className="flex items-center gap-3 rounded-xl p-2.5 border border-border/70 bg-card/80 shadow-2xs">
            <div className="size-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0 border border-primary/30/70 text-xs">
              TU
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">Pegawai Tata Usaha</p>
              <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                <ShieldCheck className="size-3 text-primary shrink-0" />
                Administrator Sistem
              </p>
            </div>
            <Link href="/login" title="Keluar / Masuk Kembali" className="text-muted-foreground hover:text-rose-600 p-1.5 rounded-lg transition-colors"
            >
              <LogOut className="size-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 min-w-0 w-full max-w-full ${desktopCollapsed ? "" : "lg:pl-80"}`}>
        {/* Dedicated Mobile Header (lg:hidden) */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/70 bg-background/80 p-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg focus-visible:outline-primary" aria-label="Buka/tutup menu navigasi" aria-expanded={sidebarOpen}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
                <School className="size-4" />
              </div>
              <span className="font-bold text-base text-foreground tracking-tight">YuranKu</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">
                Admin
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button type="button" onClick={() => setNotifOpen((o) => !o)}
              className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground transition-colors" aria-label={`Notifikasi sistem${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
            >
              <Bell className="size-4.5" />
              <NotificationBadge count={unreadCount} />
            </button>
          </div>
        </header>

        {/* Desktop Top Navbar — bar terapung gaya financial dashboard */}
        <header className="sticky top-0 z-30 hidden w-full px-6 pt-4 lg:block lg:px-8">
          <div className="flex h-16 w-full items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card px-5">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setDesktopCollapsed((c) => !c)}
                className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs" aria-label="Buka/tutup navigasi" aria-expanded={!desktopCollapsed}
              >
                <School className="size-4" />
              </button>
              {/* Tajuk tab semasa */}
              <Suspense>
                <HeaderTitle />
              </Suspense>
            </div>

            {/* Carian global */}
            <form role="search" onSubmit={(e) => {
                e.preventDefault();
                const q = searchRef.current?.value.trim();
                if (q) router.push(`/admin?tab=siswa&q=${encodeURIComponent(q)}`);
              }}
              className="relative hidden w-full max-w-md md:block"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input ref={searchRef}
                type="search" placeholder="Cari apa saja..." aria-label="Cari siswa atau transaksi" className="h-11 w-full rounded-full border border-transparent bg-muted/80 pl-11 pr-16 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                ⌘K
              </kbd>
            </form>

            {/* Kluster kanan */}
            <div className="flex shrink-0 items-center gap-1">
              <ThemeToggle />

              {/* Bantuan */}
              <div className="relative">
                <button type="button" onClick={() => { setHelpOpen((o) => !o); setNotifOpen(false); setUserOpen(false); }}
                  className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Bantuan" aria-expanded={helpOpen}
                >
                  <CircleHelp className="size-[18px]" />
                </button>
                {helpOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-card p-4 shadow-xl">
                    <p className="text-sm font-bold text-foreground">Bantuan pantas</p>
                    <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                      <li className="flex items-center justify-between gap-2">
                        <span>Fokus ke carian</span>
                        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-semibold">⌘K</kbd>
                      </li>
                      <li>Carian akan membuka tab Data Siswa dengan kata kunci Anda.</li>
                      <li>Klik ikon loceng untuk melihat notifikasi sistem terkini.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Notifikasi */}
              <div className="relative">
                <button type="button" onClick={() => { setNotifOpen((o) => !o); setHelpOpen(false); setUserOpen(false); }}
                  className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground transition-colors" aria-label={`Notifikasi sistem${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
                >
                  <Bell className="size-[18px]" />
                  <NotificationBadge count={unreadCount} />
                </button>
                {notifOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <p className="text-sm font-bold text-foreground">Notifikasi</p>
                      <button type="button" onClick={() => setNotifs((ns) => ns.map((n) => ({ ...n, dibaca: true })))}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Tandai semua dibaca
                      </button>
                    </div>
                    <ul className="max-h-80 divide-y divide-border overflow-y-auto">
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
              </div>

              {/* Chip pengguna */}
              <div className="relative">
                <button type="button" onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); setHelpOpen(false); }}
                  className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-2 transition-colors hover:bg-accent" aria-label="Menu akun" aria-expanded={userOpen}
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-md" aria-hidden>
                    AD
                  </span>
                  <span className="hidden text-left xl:block">
                    <span className="block max-w-32 truncate text-xs font-semibold text-foreground">Administrator Demo</span>
                    <span className="block text-[10px] text-muted-foreground">@admin</span>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
                </button>
                {userOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white" aria-hidden>
                        AD
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">Administrator Demo</p>
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <ShieldCheck className="size-3 shrink-0 text-primary" />
                          Administrator Sistem
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tahun Ajaran</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {SESI_LIST.map((s) => (
                          <button key={s}
                            type="button" onClick={() => { setSesi(s); localStorage.setItem("yuran-sesi", s); }}
                            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                              s === sesi
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Link href="/login" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-muted py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
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

        {/* Page Children Container */}
        <main className="relative flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full min-w-0 mx-auto overflow-x-hidden">
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
