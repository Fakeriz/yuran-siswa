"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ChevronDown, Upload, Download, FileSpreadsheet, Sparkles } from "lucide-react";

export interface CatatPembayaranDropdownProps {
  onCatatPembayaran: () => void;
  onImpor: () => void;
  onEkspor: () => void;
  selectedMonth?: string;
  totalRecords?: number;
  align?: "left" | "right";
  className?: string;
}

export function CatatPembayaranDropdown({
  onCatatPembayaran,
  onImpor,
  onEkspor,
  selectedMonth,
  totalRecords,
  align = "right",
  className = "",
}: CatatPembayaranDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Tutup dropdown saat tombol Escape ditekan
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full sm:w-auto text-left ${className}`}>
      {/* Split Action Button */}
      <div className="flex w-full sm:w-auto items-stretch rounded-xl border border-primary/30 bg-primary shadow-xs transition-all hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary/40">
        {/* Tombol Utama: Catat Pembayaran */}
        <motion.button
          type="button"
          onClick={onCatatPembayaran}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-1 sm:flex-initial items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-hidden"
          title="Buka form pencatatan pembayaran yuran baru"
        >
          <Plus className="size-4 shrink-0" />
          <span className="whitespace-nowrap">Catat Pembayaran</span>
        </motion.button>

        {/* Separator Garis Halus */}
        <div className="w-px self-stretch bg-primary-foreground/20" />

        {/* Tombol Dropdown Toggle (Impor & Ekspor) */}
        <motion.button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          whileTap={{ scale: 0.94 }}
          className="flex items-center justify-center px-2.5 py-2 text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-hidden"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Pilihan lainnya: Impor dan Ekspor data"
          title="Buka pilihan Impor dan Ekspor"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <ChevronDown className="size-3.5" />
          </motion.div>
        </motion.button>
      </div>

      {/* Floating Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 28,
            }}
            className={`absolute top-full z-50 mt-2 w-72 sm:w-80 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-md focus:outline-hidden ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {/* Header Menu */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/70 mb-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Aksi & Berkas Data
                </span>
              </div>
              {selectedMonth && (
                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                  {selectedMonth}
                </span>
              )}
            </div>

            <div className="space-y-1">
              {/* Opsi 1: Catat Pembayaran (Aksi Cepat) */}
              <motion.button
                type="button"
                onClick={() => handleAction(onCatatPembayaran)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-full items-start gap-3 rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-primary/10 focus-visible:outline-hidden"
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Plus className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Catat Pembayaran
                    </p>
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                      Aksi Utama
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                    Buka formulir pencatatan yuran siswa baru
                  </p>
                </div>
              </motion.button>

              <div className="my-1 border-t border-border/50" />

              {/* Opsi 2: Impor Data Siswa */}
              <motion.button
                type="button"
                onClick={() => handleAction(onImpor)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-full items-start gap-3 rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-muted/80 focus-visible:outline-hidden"
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-card group-hover:text-foreground group-hover:shadow-2xs transition-all">
                  <Upload className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      Impor Data Siswa
                    </p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      .csv / .xlsx
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                    Unggah daftar nama dan grup siswa sekaligus
                  </p>
                </div>
              </motion.button>

              {/* Opsi 3: Ekspor Rekap CSV */}
              <motion.button
                type="button"
                onClick={() => handleAction(onEkspor)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-full items-start gap-3 rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-muted/80 focus-visible:outline-hidden"
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-card group-hover:text-foreground group-hover:shadow-2xs transition-all">
                  <Download className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      Ekspor Data CSV
                    </p>
                    {totalRecords !== undefined && (
                      <span className="text-[10px] text-muted-foreground">
                        {totalRecords} baris
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                    Unduh data transaksi yuran {selectedMonth || "aktif"}
                  </p>
                </div>
              </motion.button>
            </div>

            {/* Footer Ringkas */}
            <div className="mt-2 pt-2 border-t border-border/70 px-2 pb-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 text-[10px]">
                <FileSpreadsheet className="size-3 text-muted-foreground" />
                Format standar UTF-8
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5 rounded"
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
