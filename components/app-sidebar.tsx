"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  PanelLeftClose,
  PanelLeft,
  MoreHorizontal,
  LogOut,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  School,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { loginDemo } from "@/app/(auth)/login/actions";

export interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export interface SidebarNotification {
  id: string;
  judul: string;
  pesan: string;
  masa: string;
  dibaca: boolean;
  href?: string;
  tab?: string;
}

export interface AppSidebarProps {
  sections: SidebarSection[];
  homeHref: string;
  appName?: string;
  subtitle?: string;
  logoIcon?: React.ReactNode;
  roleBadge?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  isActive: (item: { href: string }) => boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  userInitials?: string;
  userRole?: string;
  onLogout?: () => void;
  notifications?: SidebarNotification[];
  onNotificationClick?: (notif: SidebarNotification) => void;
  onMarkAllNotificationsRead?: () => void;
  footerExtra?: ReactNode;
  className?: string;
}

export function AppSidebar({
  sections,
  homeHref,
  appName = "YuranKu",
  subtitle = "Siswa & Yuran",
  logoIcon,
  roleBadge,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  onNavigate,
  isActive,
  searchable = true,
  searchPlaceholder = "Cari menu...",
  userName = "Administrator",
  userEmail = "admin@yuranku.com",
  userAvatar,
  userInitials = "AD",
  userRole,
  onLogout,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  footerExtra,
  className = "",
}: AppSidebarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Internal collapse state if uncontrolled
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const expandSidebar = () => {
    if (isCollapsed) {
      if (onToggleCollapse) {
        onToggleCollapse();
      } else {
        setInternalCollapsed(false);
      }
    }
  };

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  // Keyboard shortcut ⌘B / Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // User popover state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Notifications popover state
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const collapsedNotifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications ? notifications.filter((n) => !n.dibaca).length : 0;

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      const isInsideNotif =
        (notifRef.current && notifRef.current.contains(target)) ||
        (notifPanelRef.current && notifPanelRef.current.contains(target)) ||
        (collapsedNotifRef.current && collapsedNotifRef.current.contains(target));
      if (!isInsideNotif) {
        setNotifOpen(false);
      }
    };
    if (userMenuOpen || notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen, notifOpen]);

  // Filter sections based on search query (no numbers, no sub pages)
  const q = searchQuery.trim().toLowerCase();
  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!q) return true;
        return item.name.toLowerCase().includes(q);
      }),
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <motion.aside
      layout
      transition={{ type: "spring", stiffness: 350, damping: 32 }}
      animate={{ width: isCollapsed ? 76 : 235 }}
      style={{ width: isCollapsed ? 76 : 235 }}
      className={`relative flex h-full flex-col overflow-visible rounded-3xl border border-border bg-card text-card-foreground shadow-lg transition-colors duration-200 ${className}`}
    >
      {/* ============================================================
          TOP HEADER: Logo + Brand + Collapse Toggle
      ============================================================ */}
      <div className="flex h-16 shrink-0 items-center px-3.5">
        <div
          className={`flex w-full items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {/* Logo + Brand Link (clicking in collapsed mode expands sidebar) */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) {
                  expandSidebar();
                } else {
                  router.push(homeHref);
                  onNavigate?.();
                }
              }}
              className="group flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title={isCollapsed ? "Kembangkan Menu (Klik Icon)" : appName}
              aria-label={isCollapsed ? "Kembangkan Menu" : appName}
            >
              {/* Squircle App Logo — uses primary theme color */}
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-transform duration-200 group-hover:scale-105">
                {logoIcon ?? <School className="size-5" aria-hidden="true" />}
              </div>

              {/* Title & Subtitle (only in expanded mode) */}
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="min-w-0 flex-1 overflow-hidden text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold tracking-tight text-foreground">
                        {appName}
                      </span>
                      {roleBadge && (
                        <span className="shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {roleBadge}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] font-medium text-muted-foreground">
                      {subtitle}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Top Actions: Collapse Toggle */}
          {!isCollapsed ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleCollapse}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Ciutkan navigasi (⌘B)"
                title="Ciutkan navigasi (⌘B)"
              >
                <PanelLeftClose className="size-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* ============================================================
          SEARCH BAR
      ============================================================ */}
      {searchable && (
        <div className="px-3 pt-1 pb-2">
          {!isCollapsed ? (
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-xl border border-border bg-muted/50 pl-9 pr-3 text-xs font-medium text-foreground placeholder:text-muted-foreground transition-all focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Bersihkan carian"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  expandSidebar();
                  setTimeout(() => searchInputRef.current?.focus(), 150);
                }}
                className="group relative flex size-10 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                aria-label="Cari menu (Klik untuk kembangkan)"
                title="Cari menu"
              >
                <Search className="size-4" aria-hidden="true" />
                {/* Floating Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3 hidden rounded-lg border border-border bg-popover px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-popover-foreground shadow-lg group-hover:block z-50">
                  Cari menu
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          MAIN NAVIGATION LIST (Scrollable, Clean, No Numbers/Badges)
      ============================================================ */}
      <nav
        aria-label="Menu navigasi"
        className="flex-1 overflow-y-auto px-3 py-1 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20"
      >
        {filteredSections.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Tidak ada menu sepadan.
          </p>
        ) : (
          filteredSections.map((section, sIndex) => (
            <div key={section.title ?? sIndex} className="space-y-1">
              {/* Section Header (only when title is present and expanded) */}
              {section.title && !isCollapsed ? (
                <div className="flex items-center px-2.5 pb-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {section.title}
                  </span>
                </div>
              ) : null}

              {/* Items in Section — Direct, Clean, No Numbers */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const itemIsActive = isActive(item);

                  // Collapsed Item View — Clicking expands sidebar and navigates!
                  if (isCollapsed) {
                    return (
                      <div key={item.name} className="relative group flex justify-center">
                        <Link
                          href={item.href}
                          onClick={() => {
                            expandSidebar();
                            onNavigate?.();
                          }}
                          aria-current={itemIsActive ? "page" : undefined}
                          className={`relative flex size-10 items-center justify-center rounded-xl transition-all ${
                            itemIsActive
                              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                          title={item.name}
                        >
                          <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                        </Link>

                        {/* Floating Tooltip */}
                        <div className="pointer-events-none group-hover:pointer-events-auto absolute left-full ml-3 hidden rounded-xl border border-border bg-popover px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-popover-foreground shadow-xl z-50 group-hover:block">
                          {item.name}
                        </div>
                      </div>
                    );
                  }

                  // Expanded Item View — Clean full width button
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={itemIsActive ? "page" : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-xs transition-colors ${
                        itemIsActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon
                        className={`size-4.5 shrink-0 transition-colors ${
                          itemIsActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>

      {/* Extra Footer Slot (e.g. Sesi picker in mobile drawer) */}
      {footerExtra}

      {/* ============================================================
          BOTTOM USER PROFILE FOOTER
      ============================================================ */}
      <div className="relative shrink-0 p-2.5 border-t border-border" ref={userMenuRef}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2.5 rounded-2xl p-2 transition-colors hover:bg-muted/60">
            {/* User Avatar + Info Button */}
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
              aria-expanded={userMenuOpen}
              aria-label="Menu pengguna"
            >
              {/* Avatar circle — uses primary theme color */}
              <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shadow-xs border border-border">
                {userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="size-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>

              {/* Name & Email */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-foreground">
                  {userName}
                </p>
                <p className="truncate text-[11px] font-medium text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </button>

            {/* Options Button (...) */}
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Pilihan pengguna"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        ) : (
          /* Collapsed Avatar Button — clicking expands or opens menu */
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                expandSidebar();
                setUserMenuOpen(true);
              }}
              className="group relative flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs border border-border transition-transform hover:scale-105"
              aria-label="Profil pengguna (Klik untuk kembangkan)"
              title={userName}
            >
              {userAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userAvatar}
                  alt={userName}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                userInitials
              )}

              {/* Floating Tooltip */}
              <span className="pointer-events-none absolute left-full ml-3 hidden rounded-lg border border-border bg-popover px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-popover-foreground shadow-lg group-hover:block z-50">
                {userName}
              </span>
            </button>
          </div>
        )}

        {/* User Popover Menu */}
        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`absolute bottom-full mb-2 z-50 w-60 rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-xl ${
                isCollapsed ? "left-full ml-2" : "left-2"
              }`}
            >
              <div className="border-b border-border p-2">
                <p className="text-xs font-bold text-foreground">{userName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                {userRole && (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    <ShieldCheck className="size-3" />
                    <span>Peran: {userRole}</span>
                  </span>
                )}
              </div>

              {/* Theme Toggle Options */}
              <div className="py-1">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tema Paparan
                </p>
                <div className="grid grid-cols-3 gap-1 px-1">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                      theme === "light"
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Sun className="size-3.5" />
                    <span>Terang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                      theme === "dark"
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Moon className="size-3.5" />
                    <span>Gelap</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                      theme === "system"
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Laptop className="size-3.5" />
                    <span>Auto</span>
                  </button>
                </div>
              </div>

              {/* Ganti Akun Demo */}
              <div className="py-1 border-t border-border">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Ganti Akun Demo
                </p>
                <div className="grid grid-cols-3 gap-1 px-1">
                  {(
                    [
                      { role: "admin", label: "Admin" },
                      { role: "staff", label: "Staf" },
                      { role: "orang_tua", label: "Orang Tua" },
                    ] as const
                  ).map((r) => {
                    const isCurrent =
                      (r.role === "admin" && roleBadge?.toLowerCase() === "admin") ||
                      (r.role === "staff" && roleBadge?.toLowerCase() === "staf") ||
                      (r.role === "orang_tua" && (roleBadge?.toLowerCase() === "orang tua" || roleBadge?.toLowerCase() === "wali"));
                    return (
                      <button
                        key={r.role}
                        type="button"
                        disabled={isCurrent}
                        onClick={async () => {
                          setUserMenuOpen(false);
                          const dest = await loginDemo(r.role);
                          router.push(dest);
                        }}
                        className={`flex items-center justify-center rounded-lg py-1.5 text-xs font-medium transition-colors ${
                          isCurrent
                            ? "bg-primary text-primary-foreground font-bold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-border pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    if (onLogout) {
                      onLogout();
                    } else {
                      router.push("/login");
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                  <span>Log Keluar</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
