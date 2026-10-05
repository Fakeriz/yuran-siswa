"use client";

import { useState } from "react";
import { ChevronDown, Wallet } from "lucide-react";

const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** Data dummy kutipan bulanan (RM) — selaras dengan angka KPI dasbor. */
const DATA_TAHUNAN: Record<string, number[]> = {
  "2026": [18500, 19800, 21200, 20100, 22300, 23100, 21900, 22800, 23600, 24500, 0, 0],
  "2025": [15200, 16800, 17400, 18100, 17900, 19200, 19800, 20100, 18900, 19600, 20300, 21100],
};

const TAHUN_TERKINI = "2026";
const BULAN_SEMASA = 9; // Oktober (index 0)

function formatRM(n: number): string {
  return `RM ${n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPadat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

/**
 * Carta bar pendapatan tahunan — 12 batang bulanan, bulan semasa
 * diserlahkan ungu dengan tooltip nilai.
 */
export function CartaTahunan() {
  const [tahun, setTahun] = useState(TAHUN_TERKINI);
  const [menuTahun, setMenuTahun] = useState(false);
  const data = DATA_TAHUNAN[tahun];
  const maks = Math.max(...data, 1);
  const jumlah = data.reduce((a, b) => a + b, 0);
  const menyerlah = tahun === TAHUN_TERKINI ? BULAN_SEMASA : -1;

  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-700 sm:text-lg dark:text-slate-200">
            Ringkasan Transaksi
          </h2>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {formatRM(jumlah)}
          </p>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuTahun((o) => !o)}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-haspopup="listbox"
            aria-expanded={menuTahun}
          >
            Tahun {tahun}
            <ChevronDown className="size-3.5" aria-hidden />
          </button>
          {menuTahun && (
            <div
              role="listbox"
              className="absolute right-0 z-20 mt-2 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
              {Object.keys(DATA_TAHUNAN).map((t) => (
                <button
                  key={t}
                  role="option"
                  aria-selected={t === tahun}
                  type="button"
                  onClick={() => { setTahun(t); setMenuTahun(false); }}
                  className={`block w-full px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    t === tahun ? "text-violet-700 dark:text-violet-300" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bar */}
      <div className="mt-4 flex h-52 items-end gap-1.5 sm:h-60 sm:gap-2.5" role="img" aria-label={`Carta bar kutipan bulanan tahun ${tahun}`}>
        {data.map((nilai, i) => {
          const tinggi = nilai > 0 ? Math.max((nilai / maks) * 100, 4) : 0;
          const aktif = i === menyerlah;
          return (
            <div key={BULAN_PENDEK[i]} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
              <div className="relative flex w-full flex-1 items-end justify-center">
                {aktif && nilai > 0 && (
                  <span className="absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-lg bg-violet-600 px-2 py-1 text-[10px] font-bold text-white shadow-md">
                    {formatRM(nilai)}
                    <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-violet-600" aria-hidden />
                  </span>
                )}
                <div
                  className={`w-full max-w-10 rounded-t-lg transition-all ${
                    aktif
                      ? "bg-gradient-to-t from-violet-600 to-violet-400 shadow-[0_8px_20px_-6px_rgba(124,108,248,0.7)]"
                      : nilai > 0
                        ? "bg-[repeating-linear-gradient(-45deg,#e2e8f0_0px,#e2e8f0_3px,#f1f5f9_3px,#f1f5f9_6px)] dark:bg-[repeating-linear-gradient(-45deg,#334155_0px,#334155_3px,#1e293b_3px,#1e293b_6px)]"
                        : "bg-transparent"
                  }`}
                  style={{ height: `${tinggi}%` }}
                  title={nilai > 0 ? `${BULAN_PENDEK[i]}: ${formatRM(nilai)}` : `${BULAN_PENDEK[i]}: tiada data`}
                />
              </div>
              <span className={`text-[10px] sm:text-[11px] ${aktif ? "font-bold text-violet-700 dark:text-violet-300" : "text-slate-400 dark:text-slate-500"}`}>
                {BULAN_PENDEK[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Skala & legenda */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Skala: 0 – {formatPadat(maks)} · nilai dalam Ringgit Malaysia
        </p>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-violet-500" aria-hidden /> Bulan semasa
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden /> Bulan lain
          </span>
        </div>
      </div>
    </div>
  );
}

export interface KemajuanGrup {
  nama: string;
  terkumpul: number;
  sasaran: number;
}

/**
 * Panel kemajuan pembayaran bulanan per grup — baris progress ungu
 * gaya "Sales Overview".
 */
export function PanelKemajuanGrup({ grup }: { grup: KemajuanGrup[] }) {
  const jumlahTerkumpul = grup.reduce((a, g) => a + g.terkumpul, 0);

  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300" aria-hidden>
          <Wallet className="size-4.5" />
        </span>
        <h2 className="text-base font-semibold text-slate-700 sm:text-lg dark:text-slate-200">
          Kemajuan Grup
        </h2>
      </div>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Jumlah Terkumpul</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          {formatRM(jumlahTerkumpul)}
        </p>
        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          ↑ 12.4%
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {grup.map((g) => {
          const peratus = g.sasaran > 0 ? Math.min(Math.round((g.terkumpul / g.sasaran) * 100), 100) : 0;
          return (
            <div key={g.nama}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-medium text-slate-600 dark:text-slate-300">{g.nama}</span>
                <span className="shrink-0 font-semibold text-violet-700 dark:text-violet-300">{peratus}%</span>
              </div>
              <div
                className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                role="progressbar"
                aria-valuenow={peratus}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Kemajuan ${g.nama}`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
                  style={{ width: `${peratus}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                {formatRM(g.terkumpul)} / {formatRM(g.sasaran)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
