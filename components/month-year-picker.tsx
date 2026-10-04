"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { CalendarIcon, ArrowRightIcon } from "@/components/icons";

const BULAN = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

const POPUP_W = 320;
const POPUP_H = 340;

export function MonthYearPicker({
  month,
  year,
  onMonthChange,
  onYearChange,
}: {
  month: string;
  year: string;
  onMonthChange: (m: string) => void;
  onYearChange: (y: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const years = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

  // Ukur posisi butang & pilih arah popup supaya tidak terpotong
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: kalau ruang kanan tak cukup, rapat ke kanan butang
    const left = r.left + POPUP_W > vw ? Math.max(8, r.right - POPUP_W) : r.left;
    // Vertikal: kalau ruang bawah tak cukup, buka ke atas
    const top =
      r.bottom + POPUP_H > vh ? Math.max(8, r.top - POPUP_H - 8) : r.bottom + 8;

    setPos({ left, top });
  }, [open ]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          setViewYear(year);
          setOpen((o) => !o);
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:border-gray-400"
      >
        <CalendarIcon className="size-3.5 text-gray-400" />
        <span className="hidden sm:inline">
          {month} {year}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
            style={{ left: pos.left, top: pos.top, width: POPUP_W }}
          >
            {/* Navigasi tahun */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const idx = years.indexOf(viewYear);
                  if (idx > 0) setViewYear(years[idx - 1]);
                }}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <ArrowRightIcon className="size-4 rotate-180" />
              </button>
              <span className="text-sm font-bold text-gray-900">{viewYear}</span>
              <button
                type="button"
                onClick={() => {
                  const idx = years.indexOf(viewYear);
                  if (idx < years.length - 1) setViewYear(years[idx + 1]);
                }}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <ArrowRightIcon className="size-4" />
              </button>
            </div>

            {/* Grid bulan */}
            <div className="grid grid-cols-3 gap-2">
              {BULAN.map((b) => {
                const active = b === month && viewYear === year;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      onMonthChange(b);
                      onYearChange(viewYear);
                      setOpen(false);
                    }}
                    className={`rounded-xl px-1 py-2.5 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-emerald-800 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {b.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
