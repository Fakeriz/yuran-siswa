"use client";

// Ilustrasi tampilan aplikasi: tiruan visual panel status yuran.
// Sengaja tanpa angka dan tanpa nama (R-17/R-18): hanya status bulan
// dan aktivitas generik, ditandai jelas sebagai ilustrasi.

import { CalendarCheck2, FileCheck2, ReceiptText, UploadCloud } from "lucide-react";

const BULAN = [
  { nama: "Jan", lunas: true },
  { nama: "Feb", lunas: true },
  { nama: "Mar", lunas: true },
  { nama: "Apr", lunas: true },
  { nama: "Mei", lunas: true },
  { nama: "Jun", lunas: true },
  { nama: "Jul", lunas: true },
  { nama: "Agu", lunas: false },
  { nama: "Sep", lunas: false },
  { nama: "Okt", lunas: false },
  { nama: "Nov", lunas: false },
  { nama: "Des", lunas: false },
];

const AKTIVITAS = [
  {
    ikon: CalendarCheck2,
    teks: "Pembayaran bulan Julai dicatat",
    waktu: "2 jam lalu",
  },
  {
    ikon: UploadCloud,
    teks: "Bukti bayar diunggah ke arsip",
    waktu: "Kemarin",
  },
  {
    ikon: FileCheck2,
    teks: "Kwitansi resmi diterbitkan admin",
    waktu: "3 hari lalu",
  },
];

export function DashboardMock() {
  return (
    <div
      aria-label="Ilustrasi tampilan panel status yuran"
      className="relative overflow-hidden rounded-3xl border border-white bg-white/50 p-4 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.35)] backdrop-blur-xl sm:p-6 dark:border-slate-700/60 dark:bg-slate-900/60 dark:shadow-[0_30px_80px_-20px_rgba(37,99,235,0.25)]"
    >
      {/* Kepala panel */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ReceiptText className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Status Yuran 2026
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contoh tampilan portal orang tua
            </p>
          </div>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
          Ilustrasi
        </span>
      </div>

      {/* Petak 12 bulan */}
      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {BULAN.map((b) => (
          <div
            key={b.nama}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold ${
              b.lunas
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
            }`}
          >
            <span>{b.nama}</span>
            <span
              className={`size-2 rounded-full ${b.lunas ? "bg-emerald-500" : "bg-rose-500"}`}
              aria-hidden="true"
            />
            <span className="sr-only">{b.lunas ? "sudah bayar" : "belum bayar"}</span>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
          Sudah bayar
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-rose-500" aria-hidden="true" />
          Belum bayar
        </span>
      </div>

      {/* Aktivitas terakhir */}
      <div className="mt-5 space-y-2 border-t border-slate-200/70 pt-4 dark:border-slate-700/60">
        {AKTIVITAS.map((a) => (
          <div key={a.teks} className="flex items-center gap-3 text-sm">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <a.ikon className="size-4" aria-hidden="true" />
            </span>
            <p className="flex-1 text-slate-700 dark:text-slate-300">{a.teks}</p>
            <p className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{a.waktu}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
