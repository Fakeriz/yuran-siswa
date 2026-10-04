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
      <div className="size-9 rounded-xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
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
        className="flex size-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-2xs hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-emerald-500 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        {theme === "dark" ? (
          <Moon className="size-4.5 text-emerald-400" />
        ) : theme === "light" ? (
          <Sun className="size-4.5 text-amber-500" />
        ) : (
          <Monitor className="size-4.5 text-teal-400" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl z-50 dark:border-slate-800 dark:bg-slate-900">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider dark:text-slate-500">
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
                    ? "bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/80 dark:text-emerald-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5" />
                  <span>{label}</span>
                </div>
                {theme === id && <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
