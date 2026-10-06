"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, CircleHelp, LogOut, Search, Settings } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBadge } from "./notification-badge";

export interface HeaderNotification {
  id: string;
  judul: string;
  pesan: string;
  masa: string;
  dibaca: boolean;
  href?: string;
}

interface DashboardHeaderProps {
  title: string;
  titleIcon?: ReactNode;
  userName: string;
  userHandle: string;
  userInitials: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  notifications?: HeaderNotification[];
  onNotificationClick?: (notif: HeaderNotification) => void;
  onMarkAllRead?: () => void;
  onCollapseSidebar?: () => void;
  collapseIcon?: ReactNode;
  userMenuItems?: ReactNode;
}

export function DashboardHeader({
  title,
  titleIcon,
  userName,
  userHandle,
  userInitials,
  searchPlaceholder = "Cari apa saja...",
  onSearch,
  notifications = [],
  onNotificationClick,
  onMarkAllRead,
  onCollapseSidebar,
  collapseIcon,
  userMenuItems,
}: DashboardHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.dibaca).length;

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

  const closeAll = () => {
    setNotifOpen(false);
    setHelpOpen(false);
    setUserOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 hidden w-full px-6 pt-4 lg:block lg:px-8">
      <div className="flex h-16 w-full items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card px-5">
        <div className="flex items-center gap-3">
          {onCollapseSidebar && (
            <button type="button" onClick={onCollapseSidebar}
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs" aria-label="Buka/tutup navigasi"
            >
              {collapseIcon}
            </button>
          )}
          {titleIcon}
          <h1 className="shrink-0 truncate text-lg font-bold tracking-tight text-foreground">{title}</h1>
        </div>

        {onSearch && (
          <form role="search" onSubmit={(e) => {
              e.preventDefault();
              const q = searchRef.current?.value.trim();
              if (q) onSearch(q);
            }}
            className="relative hidden w-full max-w-md md:block"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input ref={searchRef}
              type="search" placeholder={searchPlaceholder} aria-label={searchPlaceholder}
              className="h-11 w-full rounded-full border border-transparent bg-muted/80 pl-11 pr-16 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              ⌘K
            </kbd>
          </form>
        )}

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />

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
                  <li>Klik ikon loceng untuk melihat notifikasi terkini.</li>
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <button type="button" onClick={() => { setNotifOpen((o) => !o); setHelpOpen(false); setUserOpen(false); }}
              className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground transition-colors"
              aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
            >
              <Bell className="size-[18px]" />
              <NotificationBadge count={unreadCount} />
            </button>
            {notifOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-bold text-foreground">Notifikasi</p>
                  {onMarkAllRead && (
                    <button type="button" onClick={onMarkAllRead}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="px-4 py-6 text-center text-xs text-muted-foreground">Tidak ada notifikasi.</li>
                  ) : notifications.map((n) => (
                    <li key={n.id}>
                      <button type="button" onClick={() => { onNotificationClick?.(n); closeAll(); }}
                        className={`block w-full px-4 py-3 text-left hover:bg-accent ${!n.dibaca ? "bg-primary/10" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground">{n.judul}</p>
                          {!n.dibaca && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.pesan}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">{n.masa}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <button type="button" onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); setHelpOpen(false); }}
              className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-2 transition-colors hover:bg-accent" aria-label="Menu akun" aria-expanded={userOpen}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-md" aria-hidden>
                {userInitials}
              </span>
              <span className="hidden text-left xl:block">
                <span className="block max-w-32 truncate text-xs font-semibold text-foreground">{userName}</span>
                <span className="block text-[10px] text-muted-foreground">@{userHandle}</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
            </button>
            {userOpen && (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-card p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white" aria-hidden>
                    {userInitials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                    <p className="truncate text-xs text-muted-foreground">@{userHandle}</p>
                  </div>
                </div>
                {userMenuItems}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
