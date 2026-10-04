"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarIcon } from "@/components/icons";

const BULAN = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];
const TAHUN = ["2024", "2025", "2026", "2027"];

const ITEM_H = 36; // px per item

function Wheel({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedIdx = items.indexOf(value);

  // Scroll to selected on mount / value change from outside
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = selectedIdx * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      if (items[clamped] !== value) onChange(items[clamped]);
    }, 120);
  };

  return (
    <div className="relative w-28">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-[108px] overflow-y-scroll"
        style={{ scrollbarWidth: "none", scrollSnapType: "y mandatory" }}
      >
        {/* spacer atas & bawah supaya item boleh ke tengah */}
        <div style={{ height: ITEM_H }} />
        {items.map((item) => (
          <div
            key={item}
            onClick={() => onChange(item)}
            className={`flex cursor-pointer items-center justify-center text-sm transition-colors ${
              item === value ? "font-bold text-gray-900" : "text-gray-400"
            }`}
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
          >
            {item}
          </div>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
      {/* garis penanda tengah */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-lg bg-gray-100"
        style={{ height: ITEM_H }}
      />
    </div>
  );
}

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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
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
          <div className="absolute left-0 top-full z-50 mt-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="flex gap-2">
              <Wheel items={BULAN} value={month} onChange={onMonthChange} />
              <Wheel items={TAHUN} value={year} onChange={onYearChange} />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-xl bg-emerald-800 py-2 text-xs font-semibold text-white hover:bg-emerald-900"
            >
              Pilih
            </button>
          </div>
        </>
      )}
    </div>
  );
}
