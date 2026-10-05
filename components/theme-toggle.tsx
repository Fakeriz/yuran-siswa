"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mencegah hydration mismatch antara server dan client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tutup dropdown bila klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="size-9 rounded-xl border border-border bg-card" />
    );
  }

  const themes = [
    { id: "light", label: "Terang (Light)", icon: Sun },
    { id: "dark", label: "Gelap (Dark)", icon: Moon },
    { id: "system", label: "Sistem (Auto)", icon: Monitor },
  ] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Tukar tema paparan"
        className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground focus-visible:outline-primary transition-colors"
      >
        {theme === "dark" ? (
          <Moon className="size-4.5 text-primary" />
        ) : theme === "light" ? (
          <Sun className="size-4.5 text-amber-500" />
        ) : (
          <Monitor className="size-4.5 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-border bg-card p-1.5 shadow-xl z-50">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Pilih Tema
          </div>
          <div className="space-y-0.5">
            {themes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTheme(id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                  theme === id
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5" />
                  <span>{label}</span>
                </div>
                {theme === id && <Check className="size-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
