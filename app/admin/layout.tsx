"use client";

import { useState, Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { HomeIcon, UsersIcon, WalletIcon, TicketIcon, DocumentIcon, AddUserIcon, NotificationIcon, CategoryIcon, CloseSquareIcon, LogoutIcon, ShieldDoneIcon, SchoolIcon } from "@/components/icons";
import { Avatar } from "@/components/avatar";
import { AdminProvider, useAdmin } from "@/components/admin-context";
import { ThemeToggle } from "@/components/theme-toggle";

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
      { name: "Dasbor Utama", href: "/admin", icon: HomeIcon },
      { name: "Aliran Kas & Yuran", href: "/admin?tab=aliran-kas", icon: WalletIcon },
    ],
  },
  {
    title: "Pengurusan (Manage)",
    items: [
      { name: "Data Talebe (Siswa)", href: "/admin?tab=siswa", icon: UsersIcon },
      { name: "Transaksi Masuk", href: "/admin?tab=transaksi", icon: WalletIcon },
      { name: "Penugasan Staf", href: "/admin?tab=penugasan", icon: SchoolIcon },
      { name: "Pengesahan Ibu Bapa", href: "/admin?tab=persetujuan", icon: AddUserIcon, badge: "Pending" },
    ],
  },
  {
    title: "Laporan (Reporting)",
    items: [
      { name: "Resit & Kwitansi", href: "/admin?tab=resit", icon: TicketIcon },
      { name: "Penyata Bulanan", href: "/admin?tab=penyata", icon: DocumentIcon },
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
          <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
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
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-600 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-[#9AA8BE] dark:hover:bg-gray-800 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`size-4.5 shrink-0 transition-colors ${
                        isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-brand-600 text-white"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
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

function TopbarControls() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([
    { id: 1, tipe: "pendaftaran", judul: "Pendaftaran ibu bapa baru", pesan: "Ahmad memerlukan pengesahan", masa: "10 minit lalu", dibaca: false, tab: "persetujuan" },
    { id: 2, tipe: "pembayaran", judul: "Bayaran diterima", pesan: "RM 500 daripada Siti binti Hassan", masa: "1 jam lalu", dibaca: false, tab: "transaksi" },
    { id: 3, tipe: "tunggakan", judul: "Tunggakan melebihi RM 5,000", pesan: "11 talebe belum menjelaskan yuran", masa: "3 jam lalu", dibaca: true, tab: "aliran-kas" },
  ]);
  const unreadCount = notifs.filter((n) => !n.dibaca).length;

  return (
    <div className="flex items-center gap-2.5">
      <ThemeToggle />
      <div className="relative">
        <button
          type="button"
          onClick={() => setNotifOpen((o) => !o)}
          className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-gray-500 shadow-2xs hover:bg-gray-50 hover:text-gray-900 transition-colors dark:border-[#2E3A52] dark:bg-elevated dark:text-[#9AA8BE]"
          aria-label="Pemberitahuan sistem"
        >
          <NotificationIcon className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden dark:border-[#2E3A52] dark:bg-elevated">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2E3A52]">
              <p className="text-sm font-bold text-gray-900 dark:text-[#F1F5F9]">Notifikasi</p>
              <button
                type="button"
                onClick={() => setNotifs((ns) => ns.map((n) => ({ ...n, dibaca: true })))}
                className="text-xs font-medium text-brand-600 hover:underline dark:text-emerald-400"
              >
                Tandai semua dibaca
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-[#2E3A52]">
              {notifs.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/admin?tab=${n.tab}`}
                    onClick={() => {
                      setNotifs((ns) => ns.map((x) => x.id === n.id ? { ...x, dibaca: true } : x));
                      setNotifOpen(false);
                    }}
                    className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${!n.dibaca ? "bg-brand-50/50 dark:bg-brand-700/20" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-900 dark:text-[#F1F5F9]">{n.judul}</p>
                      {!n.dibaca && <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-500" />}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-[#9AA8BE]">{n.pesan}</p>
                    <p className="mt-1 text-[10px] text-gray-400">{n.masa}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function HeaderTitle() {
  const { pageTitle, selectedMonth, selectedYear } = useAdmin();
  return (
    <div>
      <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl dark:text-[#F1F5F9]">
        {pageTitle}
      </h1>
      <p className="text-xs text-gray-500 dark:text-[#6B7A90]">
        {selectedMonth} {selectedYear}
      </p>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <AdminProvider>
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col antialiased dark:bg-canvas dark:text-gray-100">
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tutup menu navigasi"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setSidebarOpen(false);
          }}
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-gray-200 shadow-sm transition-transform duration-200 ease-in-out lg:translate-x-0 dark:bg-surface dark:border-[#212837] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo & Header */}
        <div className="flex h-18 items-center justify-between px-6 border-b border-gray-100 dark:border-[#212837]">
          <Link href="/admin" className="flex items-center gap-3 group focus-visible:outline-brand-500">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs group-hover:bg-brand-700 transition-colors">
              <SchoolIcon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-gray-900 tracking-tight dark:text-[#F1F5F9]">YuranKu</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md border border-brand-200/60">
                  Admin
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium dark:text-[#6B7A90]">Aylik Talebe Management</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            aria-label="Tutup navigasi"
          >
            <CloseSquareIcon className="size-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <Suspense>
          <SidebarNav onNavigate={() => setSidebarOpen(false)} />
        </Suspense>

        {/* User Profile Card & Sign Out */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 dark:border-[#212837] dark:bg-surface/50">
          <div className="flex items-center gap-3 rounded-xl p-2.5 bg-white border border-gray-200 shadow-2xs dark:bg-elevated dark:border-[#2E3A52]">
            <Avatar name="Pegawai Tata Usaha" className="size-9 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate dark:text-[#F1F5F9]">Pegawai Tata Usaha</p>
              <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                <ShieldDoneIcon className="size-3 text-brand-500 shrink-0" />
                Pentadbir Sistem
              </p>
            </div>
            <Link
              href="/login"
              title="Keluar / Log Masuk Semula"
              className="text-gray-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
            >
              <LogoutIcon className="size-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-xs px-4 sm:px-6 lg:px-8 dark:border-[#212837] dark:bg-frame/95">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl lg:hidden focus-visible:outline-brand-500"
              aria-label="Buka menu navigasi"
            >
              <CategoryIcon className="size-5" />
            </button>
            <HeaderTitle />
          </div>

          {/* Topbar Right Controls */}
          <TopbarControls />
        </header>

        {/* Page Children Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
    </AdminProvider>
  );
}
