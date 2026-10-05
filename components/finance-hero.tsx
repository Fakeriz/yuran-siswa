"use client";

import { useEffect, useState, type ReactNode } from "react";

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
 * Kepala dasbor minimal: sapaan mengikut waktu, subtajuk,
 * baris tindakan, dan grid kad KPI. Tanpa gradien dekoratif.
 */
export function FinanceHero({ name, subtitle, actions, children, kpiGridClassName }: FinanceHeroProps) {
  const [sapaan, setSapaan] = useState("Selamat Datang");
  useEffect(() => {
    setSapaan(sapaanWaktu());
  }, []);

  return (
    <section className="w-full min-w-0">
      <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {sapaan}, {name}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {actions ? (
          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">{actions}</div>
        ) : null}
      </div>

      {children ? (
        <div className={`mt-6 grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 ${kpiGridClassName ?? "xl:grid-cols-4"}`}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
