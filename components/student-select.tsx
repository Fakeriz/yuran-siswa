"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/icons";

export interface StudentOption {
  nama: string;
  grup: string;
}

export function StudentSelect({
  students,
  value,
  onChange,
  placeholder = "Taip nama siswa...",
}: {
  students: StudentOption[];
  value: string;
  onChange: (nama: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = query.toLowerCase();
  // Unik mengikut nama
  const seen = new Set<string>();
  const filtered = students.filter((s) => {
    if (seen.has(s.nama)) return false;
    seen.add(s.nama);
    return s.nama.toLowerCase().includes(q) || s.grup.toLowerCase().includes(q);
  });

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="mt-1 w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-500">
              Tiada siswa dijumpai. Nama baru akan direkod.
            </p>
          ) : (
            filtered.map((s) => (
              <button
                key={s.nama}
                type="button"
                onClick={() => {
                  onChange(s.nama);
                  setQuery(s.nama);
                  setOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-50"
              >
                <span className="block truncate text-sm font-semibold text-gray-900">
                  {s.nama}
                </span>
                <span className="block truncate text-xs text-gray-500">{s.grup}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
