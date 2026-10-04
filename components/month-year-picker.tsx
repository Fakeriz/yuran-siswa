"use client";

import { useState } from "react";
import { CalendarIcon, ArrowRightIcon } from "@/components/icons";

const BULAN = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

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

  const years = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setViewYear(year);
          setOpen((o) => !o);
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:border-gray-400"
      >
        <CalendarIcon className="size-3.5 text-gray-400" />
        <span>
          {month} {year}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
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
            <div className="grid grid-cols-3 gap-1.5">
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
                    className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors ${
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
