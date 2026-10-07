"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Filter, ChevronDown, Check, RotateCcw, X } from "lucide-react";

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
  badgeColor?: string;
}

export interface FilterSection<T extends string = string> {
  id: string;
  label: string;
  options: FilterOption<T>[];
  selected: T;
  onChange: (value: T) => void;
  defaultValue?: T;
}

export interface TableFilterDropdownProps {
  sections: FilterSection[];
  onReset?: () => void;
  label?: string;
  align?: "left" | "right";
  className?: string;
}

export function TableFilterDropdown({
  sections,
  onReset,
  label = "Filter",
  align = "right",
  className = "",
}: TableFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hitung jumlah filter yang sedang aktif (berbeda dari default)
  const activeCount = sections.reduce((acc, sec) => {
    const defaultVal = sec.defaultValue ?? sec.options[0]?.value;
    return sec.selected !== defaultVal ? acc + 1 : acc;
  }, 0);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Tutup dropdown saat tekan tombol Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      sections.forEach((sec) => {
        const defaultVal = sec.defaultValue ?? sec.options[0]?.value;
        if (defaultVal) sec.onChange(defaultVal);
      });
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button with Motion */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ${
          isOpen || activeCount > 0
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-card text-foreground hover:bg-muted/70 hover:border-border"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Buka pilihan filter tabel"
      >
        <motion.div
          animate={{ rotate: isOpen ? 15 : 0 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <Filter className="size-3.5" />
          {activeCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary animate-pulse" />
          )}
        </motion.div>

        <span>{label}</span>

        {activeCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
          >
            {activeCount}
          </motion.span>
        )}

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="size-3 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Floating Animated Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 28,
            }}
            className={`absolute top-full z-50 mt-2 w-72 sm:w-80 rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md focus:outline-hidden ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {/* Header Dropdown */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-1.5">
                <Filter className="size-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">Filter Tabel</span>
                {activeCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {activeCount} aktif
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Atur ulang semua filter"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Tutup filter"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Sections Container */}
            <div className="mt-3 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 pr-1">
              {sections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {section.label}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {section.options.find((o) => o.value === section.selected)?.label ?? section.selected}
                    </span>
                  </div>

                  {/* List of Options */}
                  <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 rounded-xl bg-muted/40 p-1 border border-border/60">
                    {section.options.map((option) => {
                      const isSelected = section.selected === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            section.onChange(option.value);
                          }}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-card text-foreground font-semibold shadow-2xs border border-border/80"
                              : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="truncate">{option.label}</span>
                            {option.count !== undefined && (
                              <span className="rounded-md bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                                {option.count}
                              </span>
                            )}
                          </div>

                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="shrink-0 text-primary"
                              >
                                <Check className="size-3.5" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary / Quick Close */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {activeCount > 0 ? `${activeCount} filter diterapkan` : "Menampilkan semua data"}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
