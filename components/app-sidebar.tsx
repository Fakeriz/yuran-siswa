"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ReceiptText, Search, X } from "lucide-react";

export interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  badge?: ReactNode;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface AppSidebarProps {
  sections: SidebarSection[];
  homeHref: string;
  onNavigate: () => void;
  isActive: (item: SidebarItem) => boolean;
  searchable?: boolean;
  footer?: ReactNode;
  roleBadge?: string;
  subtitle?: string;
}

export function AppSidebar({ sections, homeHref, onNavigate, isActive, searchable = false, footer, roleBadge, subtitle }: AppSidebarProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = sections
    .map((s) => ({ ...s, items: s.items.filter((i) => !q || i.name.toLowerCase().includes(q)) }))
    .filter((s) => s.items.length > 0);

  return (
    <>
      <div className="flex min-h-16 items-center justify-between px-5 py-3 border-b border-border">
        <Link href={homeHref} onClick={onNavigate} className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shrink-0">
            <ReceiptText className="size-4.5" />
          </span>
          <span className="flex flex-col">
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-base text-foreground tracking-tight">YuranKu</span>
              {roleBadge && (
                <span className="text-[9px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">
                  {roleBadge}
                </span>
              )}
            </span>
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </span>
        </Link>
        <button type="button" onClick={onNavigate}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors" aria-label="Tutup navigasi"
        >
          <X className="size-5" />
        </button>
      </div>
      {searchable && (
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari menu…"
              className="w-full rounded-xl border border-border bg-muted/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      )}
      <nav aria-label="Menu navigasi" className="flex-1 overflow-y-auto p-4">
        {visible.map((section, si) => (
          <div key={section.title ?? si} className={si > 0 ? "mt-6" : ""}>
            {section.title && (
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</p>
            )}
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-primary font-semibold text-primary-foreground shadow-sm" : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    <Icon className="size-[18px] shrink-0" aria-hidden />
                    <span className="flex-1">{item.name}</span>
                    {item.badge}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {footer}
    </>
  );
}
