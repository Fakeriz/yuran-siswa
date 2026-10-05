"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";

function sapaanWaktu(): string {
  const jam = new Date().getHours();
  if (jam >= 5 && jam < 11) return "Selamat Pagi";
  if (jam >= 11 && jam < 15) return "Selamat Siang";
  if (jam >= 15 && jam < 19) return "Selamat Sore";
  return "Selamat Malam";
}

interface FinanceHeroProps {
  /** Nama yang disapa, cth. "Admin" */
  name: string;
  /** Subtajuk di bawah sapaan */
  subtitle: string;
  /** Butang tindakan (pemilih bulan, ekspor, dll.) */
  actions?: ReactNode;
  /** Kad KPI — biasanya <FinanceKpi /> */
  children?: ReactNode;
  /** Override kelas grid KPI (default: 1/2/4 kolom) */
  kpiGridClassName?: string;
}

/**
 * Panel hero ungu gaya "financial dashboard": sapaan mengikut waktu,
 * subtajuk, baris tindakan, dan grid kad KPI putih di atasnya.
 * Panel kekal ungu dalam dark mode (panel jenama).
 */
export function FinanceHero({ name, subtitle, actions, children, kpiGridClassName }: FinanceHeroProps) {
  const [sapaan, setSapaan] = useState("Selamat Datang");
  useEffect(() => {
    setSapaan(sapaanWaktu());
  }, []);

  return (
    <section className="relative w-full min-w-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#7c6cf8] via-[#6f5cf6] to-[#5b48e8] p-5 text-white shadow-[0_24px_60px_-24px_rgba(108,92,246,0.55)] sm:p-7">
      {/* Hiasan cahaya lembut */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-[#c4b5fd]/25 blur-3xl" />

      <div className="relative flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl lg:text-[28px]">
            <span className="truncate">
              {sapaan}, {name}
            </span>
            <Sparkles className="size-5 shrink-0 text-amber-200" aria-hidden />
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/75">{subtitle}</p>
        </div>
        {actions ? (
          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">{actions}</div>
        ) : null}
      </div>

      {children ? (
        <div className={`relative mt-5 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 ${kpiGridClassName ?? "xl:grid-cols-4"}`}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
