"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mencegah hydration mismatch antara server dan client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-[104px] rounded-full border border-border bg-card" />
    );
  }

  const themes = [
    { id: "light", label: "Tema terang", icon: Sun },
    { id: "dark", label: "Tema gelap", icon: Moon },
    { id: "system", label: "Ikut sistem", icon: Monitor },
  ] as const;

  return (
    <div
      role="group"
      aria-label="Pilih tema tampilan"
      className="flex items-center rounded-full border border-border bg-card p-1 shadow-2xs"
    >
      {themes.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTheme(id)}
          aria-label={label}
          aria-pressed={theme === id}
          title={label}
          className={`flex size-7 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            theme === id
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
