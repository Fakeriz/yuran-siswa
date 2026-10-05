"use client";

import { Suspense, useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  Target,
  AlertCircle,
  PieChart,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Eye,
  RefreshCw,
} from "lucide-react";
import { FileUpload, type FileUploadItem } from "../../components/file-upload";
import {
  CenterMorphModal,
  CenterMorphModalClose,
  CenterMorphModalContent,
} from "../../components/center-morph-modal";
import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectTrigger,
  MorphSelectValue,
} from "../../components/morph-select";
import { Button, ButtonLink } from "../../components/motion-button";
import { FinanceHero } from "../../components/finance-hero";
import { FinanceKpi } from "../../components/finance-kpi";
import { CartaTahunan, PanelKemajuanGrup } from "../../components/finance-charts";

// Struktur jenis data berasaskan skema logik Data_Talebe & Transaksi_Masuk
export interface TalebeRecord {
  id: string; // ID_Talebe (PK)
  noTransaksi: string; // No_Transaksi (PK)
  nama: string; // Nama_Talebe
  grup: "Mevlana HE" | "Razi HE" | "Fatih HE"; // Grup
  yuranBulanan: number; // Yuran_Bulanan (Default RM 500)
  jumlahBayar: number; // Jumlah_Bayar
  bulanDibayar: string; // Bulan_Dibayar
  tanggal: string; // Tanggal
  metodeBayar: "Online Transfer (FPX)" | "DuitNow QR" | "Tunai (Kaunter)" | "Bank Transfer" | "Belum Bayar";
  status: "Lunas" | "Tunggakan" | "Sebagian";
  statusAktif: boolean; // Status_Aktif
}

// Pisahkan "bin/binti Fulan" ke baris bawah (tanpa grup, grup kini kolom sendiri)
function NamaTalebe({ nama }: { nama: string }) {
  const m = nama.match(/^(.*?)\s+(bin|binti|bt)\s+(.+)$/i);
  const namaUtama = m ? m[1].trim() : nama;
  const patronimik = m ? `${m[2].toLowerCase()} ${m[3].trim()}` : null;
  return (
    <>
      <div className="font-semibold text-slate-900 dark:text-slate-100">{namaUtama}</div>
      {patronimik && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{patronimik}</div>}
    </>
  );
}

// Data statis (dummy data) yang menyerupai yuran RM 500/bulan bagi 60 siswa
const initialTalebeData: TalebeRecord[] = [
  {
    id: "TB-001",
    noTransaksi: "TRX-202610-001",
    nama: "Ahmad Faiz bin Rosli",
    grup: "Mevlana HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "02 Okt 2026",
    metodeBayar: "Online Transfer (FPX)",
    status: "Lunas",
    statusAktif: true,
  },
  {
    id: "TB-002",
    noTransaksi: "TRX-202610-002",
    nama: "Muhammad Danial Hakim",
    grup: "Razi HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "03 Okt 2026",
    metodeBayar: "DuitNow QR",
    status: "Lunas",
    statusAktif: true,
  },
  {
    id: "TB-003",
    noTransaksi: "TRX-202610-003",
    nama: "Luqman Nurhakim bin Azman",
    grup: "Mevlana HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true,
  },
  {
    id: "TB-004",
    noTransaksi: "TRX-202610-004",
    nama: "Harith Iskandar bin Zulkifli",
    grup: "Fatih HE",
    yuranBulanan: 500,
    jumlahBayar: 250,
    bulanDibayar: "September 2026",
    tanggal: "01 Okt 2026",
    metodeBayar: "Tunai (Kaunter)",
    status: "Sebagian",
    statusAktif: true,
  },
  {
    id: "TB-005",
    noTransaksi: "TRX-202610-005",
    nama: "Umar Faruq bin Abdul Rahman",
    grup: "Razi HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "September 2026",
    tanggal: "02 Okt 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true,
  },
  {
    id: "TB-006",
    noTransaksi: "TRX-202610-006",
    nama: "Zayd Al-Khair bin Mansor",
    grup: "Mevlana HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "September 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true,
  },
  {
    id: "TB-007",
    noTransaksi: "TRX-202610-007",
    nama: "Adam Rayyan bin Mohd Shukri",
    grup: "Fatih HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Agustus 2026",
    tanggal: "04 Okt 2026",
    metodeBayar: "Online Transfer (FPX)",
    status: "Lunas",
    statusAktif: true,
  },
  {
    id: "TB-008",
    noTransaksi: "TRX-202610-008",
    nama: "Bilal bin Hisham",
    grup: "Razi HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Agustus 2026",
    tanggal: "03 Okt 2026",
    metodeBayar: "DuitNow QR",
    status: "Lunas",
    statusAktif: true,
  },
];

// Helper pemformatan mata wang Ringgit Malaysia
function formatRM(amount: number): string {
  return `RM ${amount.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function AdminContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const [records, setRecords] = useState<TalebeRecord[]>(initialTalebeData);
  const qParam = searchParams.get("q") ?? "";
  const [searchQuery, setSearchQuery] = useState(qParam);
  // Segerakkan carian jadual apabila carian global header menghantar ?q=
  useEffect(() => {
    setSearchQuery(qParam);
  }, [qParam]);
  const [selectedGroup, setSelectedGroup] = useState<string>("Semua");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2026");
  const [selectedRecord, setSelectedRecord] = useState<TalebeRecord | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);
  const recordCloseTimer = useRef<number | null>(null);
  const [showBayarModal, setShowBayarModal] = useState(false);
  const [bayarNama, setBayarNama] = useState("");
  const [bayarJumlah, setBayarJumlah] = useState("500");
  const [bayarBulan, setBayarBulan] = useState("Oktober 2026");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<TalebeRecord[]>([]);
  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);

  // Parse CSV import siswa: Nama,Grup,Kelas,Yuran Bulanan (RM),Aktif (Ya/Tidak),Sesi
  const parseImportCSV = (text: string): TalebeRecord[] => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new Error("Fail kosong atau tiada data.");
    const rows: TalebeRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      // Split CSV menghormati tanda petik
      const cols = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map((c) => c.replace(/^"|"$/g, "").trim()) ?? [];
      const [nama, grup, , yuranStr, aktifStr] = cols;
      if (!nama) throw new Error(`Baris ${i + 1}: Nama wajib diisi.`);
      const yuran = Number(yuranStr);
      if (!yuranStr || isNaN(yuran) || yuran < 0) throw new Error(`Baris ${i + 1}: Yuran Bulanan tidak valid.`);
      rows.push({
        id: `T-IMP-${Date.now()}-${i}`,
        nama,
        noTransaksi: "-",
        grup: (grup || "Mevlana HE") as TalebeRecord["grup"],
        yuranBulanan: yuran,
        jumlahBayar: 0,
        bulanDibayar: selectedMonth,
        tanggal: "-",
        metodeBayar: "Belum Bayar",
        status: "Tunggakan",
        statusAktif: (aktifStr || "Ya").toLowerCase() !== "tidak",
      });
    }
    return rows;
  };

  // --- Import CSV handlers (wired to FileUpload component) ---
  const markUploadItem = (id: string, patch: Partial<FileUploadItem>) =>
    setUploadItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const processImportFile = (item: FileUploadItem) => {
    const file = item.file;
    if (!file) return;
    markUploadItem(item.id, { status: "uploading", progress: 40, error: undefined });
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseImportCSV(String(reader.result ?? ""));
        setImportPreview(rows);
        markUploadItem(item.id, { status: "success", progress: 100 });
      } catch (err) {
        setImportPreview([]);
        markUploadItem(item.id, {
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Gagal membaca fail.",
        });
      }
    };
    reader.onerror = () => {
      setImportPreview([]);
      markUploadItem(item.id, { status: "error", progress: 0, error: "Gagal membaca fail." });
    };
    reader.readAsText(file);
  };

  const handleImportFilesAdded = (added: FileUploadItem[]) => {
    added.forEach(processImportFile);
  };

  const handleImportRemove = () => {
    setImportPreview([]);
  };

  const handleImportRetry = (item: FileUploadItem) => {
    setImportPreview([]);
    processImportFile(item);
  };

  const importCloseTimer = useRef<number | null>(null);

  // Tutup modal dahulu, kosongkan data selepas animasi tutup selesai
  // supaya kandungan tidak hilang semasa panel mengecut.
  const closeImportModal = useCallback(() => {
    setShowImportModal(false);
    if (importCloseTimer.current) window.clearTimeout(importCloseTimer.current);
    importCloseTimer.current = window.setTimeout(() => {
      setImportPreview([]);
      setUploadItems([]);
    }, 460);
  }, []);

  const handleImportOpenChange = useCallback(
    (o: boolean) => {
      if (!o) closeImportModal();
    },
    [closeImportModal],
  );

  const confirmImport = () => {
    setRecords((r) => [...importPreview, ...r]);
    closeImportModal();
  };

  const openRecordModal = useCallback((item: TalebeRecord) => {
    if (recordCloseTimer.current) window.clearTimeout(recordCloseTimer.current);
    setSelectedRecord(item);
    setRecordOpen(true);
  }, []);

  const closeRecordModal = useCallback(() => {
    setRecordOpen(false);
    if (recordCloseTimer.current) window.clearTimeout(recordCloseTimer.current);
    recordCloseTimer.current = window.setTimeout(() => setSelectedRecord(null), 460);
  }, []);

  const handleRecordOpenChange = useCallback(
    (o: boolean) => {
      if (!o) closeRecordModal();
    },
    [closeRecordModal],
  );

  // Bersihkan timer bila komponen unmount
  useEffect(
    () => () => {
      if (importCloseTimer.current) window.clearTimeout(importCloseTimer.current);
      if (recordCloseTimer.current) window.clearTimeout(recordCloseTimer.current);
    },
    [],
  );

  // Penapisan rekod Talebe secara dinamik
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.noTransaksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchGroup = selectedGroup === "Semua" || item.grup === selectedGroup;
      const matchStatus = selectedStatus === "Semua" || item.status === selectedStatus;
      const matchMonth = item.bulanDibayar === selectedMonth;

      return matchSearch && matchGroup && matchStatus && matchMonth;
    });
  }, [records, searchQuery, selectedGroup, selectedStatus, selectedMonth]);

  // Statistik Keseluruhan (KPI Math)
  const totalTarget = 30000; // 60 siswa x RM 500
  const totalPemasukan = 24500; // Total kutipan semasa
  const totalTunggakan = 5500; // Sisa tertunggak
  const persentaseKutipan = (totalPemasukan / totalTarget) * 100; // 81.67%

  // Tab yang belum ada konten khusus
  if (tab === "penugasan" || tab === "persetujuan" || tab === "penyata") {
    const titles: Record<string, string> = {
      penugasan: "Penugasan Staf",
      persetujuan: "Persetujuan Orang Tua",
      penyata: "Laporan Bulanan",
    };
    const title = titles[tab] ?? "Modul";
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">Bahagian ini dalam pembangunan.</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">
            Modul {title} akan disambungkan ke data sebenar tidak lama lagi.
          </p>
        </div>
      </div>
    );
  }

  const isDashboard = !tab;
  const isAliranKas = tab === "aliran-kas";
  const isTransaksi = tab === "transaksi";
  const isResit = tab === "resit";
  const isSiswa = tab === "siswa";
  // Untuk tab fokus jadual, sorokkan ringkasan KPI/grup supaya fokus pada kandungan tab
  const showSummary = isDashboard;

  const headerTitle =
    tab === "aliran-kas" ? "Arus Kas & Yuran"
    : tab === "siswa" ? "Data Siswa"
    : tab === "transaksi" ? "Transaksi Masuk"
    : tab === "resit" ? "Kuitansi"
    : "Dasbor Administrasi Yuran";

  const headerDesc =
    tab === "aliran-kas" ? "Ringkasan arus kas masuk dan keluar kas asrama."
    : tab === "siswa" ? "Daftar siswa terdaftar berdasarkan grup asrama."
    : tab === "transaksi" ? "Daftar semua pembayaran yuran yang diterima."
    : tab === "resit" ? "Daftar kuitansi yang telah diunggah."
    : "Sistem pengelolaan yuran bulanan asrama siswa, pencatatan penerimaan kas, dan persetujuan status pembayaran.";

  const quickActions = (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-auto">
                <MorphSelect
                  value={selectedMonth}
                  onValueChange={setSelectedMonth}
                  className="w-full text-xs font-semibold sm:w-auto sm:min-w-48"
                >
                  <MorphSelectTrigger>
                    <MorphSelectValue placeholder="Pilih bulan" />
                  </MorphSelectTrigger>
                  <MorphSelectContent>
                    <MorphSelectItem value="Oktober 2026">Bulan: Oktober 2026</MorphSelectItem>
                    <MorphSelectItem value="September 2026">Bulan: September 2026</MorphSelectItem>
                    <MorphSelectItem value="Agustus 2026">Bulan: Agustus 2026</MorphSelectItem>
                  </MorphSelectContent>
                </MorphSelect>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                  onClick={() => {
                    const header = ["ID", "No Transaksi", "Nama", "Grup", "Yuran Bulanan (RM)", "Jumlah Bayar (RM)", "Bulan", "Tanggal", "Metode", "Status"];
                    const rows = filteredRecords.map((r) => [
                      r.id, r.noTransaksi, r.nama, r.grup,
                      String(r.yuranBulanan), String(r.jumlahBayar),
                      r.bulanDibayar, r.tanggal, r.metodeBayar, r.status,
                    ]);
                    const csv = [header, ...rows]
                      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
                      .join("\n");
                    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `yuran-${selectedMonth.replace(/\s+/g, "-").toLowerCase()}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="size-3.5" />
                  <span>Ekspor</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                  onClick={() => setShowImportModal(true)}
                >
                  <Upload className="size-3.5" />
                  <span>Impor</span>
                </Button>
              </div>

              <Button
                variant="primary"
                size="sm"
                ripple
                className="w-full sm:w-auto whitespace-nowrap"
                onClick={() => setShowBayarModal(true)}
              >
                <Plus className="size-4" />
                <span>Catat Pembayaran</span>
              </Button>
            </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      {/* 1. Hero kewangan (tab utama) / header biasa (tab lain) */}
      {isDashboard ? (
        <FinanceHero
          name="Admin"
          subtitle="Dapatkan gambaran jelas tentang kinerja keuangan dan transaksi terkini."
          actions={quickActions}
        >
          <FinanceKpi
            icon={TrendingUp}
            tone="violet"
            value={formatRM(totalPemasukan)}
            label="Total pemasukan bulan ini"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                +12.4%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">dibanding bulan lalu</span>
            </div>
          </FinanceKpi>
          <FinanceKpi
            icon={Target}
            tone="green"
            value={formatRM(totalTarget)}
            label="Target pemasukan bulanan"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">Target dasar: 60 Siswa × RM 500</p>
          </FinanceKpi>
          <FinanceKpi
            icon={AlertCircle}
            tone="pink"
            value={formatRM(totalTunggakan)}
            label="Total tunggakan"
          >
            <span className="inline-flex w-fit rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
              11 Siswa belum bayar
            </span>
          </FinanceKpi>
          <FinanceKpi
            icon={PieChart}
            tone="blue"
            value={`${persentaseKutipan.toFixed(1)}%`}
            label="Tingkat penagihan yuran"
          >
            <div
              className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              role="progressbar"
              aria-valuenow={81.7}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Kemajuan penagihan"
            >
              <div className="h-full rounded-full bg-emerald-500" style={{ width: "81.7%" }} />
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">49/60 Lunas</p>
          </FinanceKpi>
        </FinanceHero>
      ) : (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {headerTitle}
            </h1>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/80 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/50">
              Yuran Bulanan
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {headerDesc}
          </p>
        </div>

        {quickActions}
      </div>
      )}

      {/* Ringkasan Aliran Kas (tab aliran-kas sahaja) */}
      {isAliranKas && (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5 w-full min-w-0">
        <div className="rounded-xl sm:rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70 min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jumlah Masuk</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">RM 24,500</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Oktober 2026 · 49 transaksi</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70 min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jumlah Keluar</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">RM 3,200</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Oktober 2026 · pengeluaran operasional</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/70 min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Saldo Bersih</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">RM 21,300</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Selisih masuk dan keluar bulan ini</p>
        </div>
      </div>
      )}

      {/* Daftar Kuitansi (tab kuitansi sahaja) */}
      {isResit && (
      <div className="rounded-xl sm:rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900/70 w-full min-w-0">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Kuitansi Terkini</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Dokumen bukti pembayaran yang dimuat naik.</p>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { no: "R-2026-1042", siswa: "Ahmad bin Ali", jumlah: "RM 500", tarikh: "02 Okt 2026" },
            { no: "R-2026-1041", siswa: "Siti binti Hassan", jumlah: "RM 500", tarikh: "02 Okt 2026" },
            { no: "R-2026-1040", siswa: "Mohd Rizal", jumlah: "RM 500", tarikh: "01 Okt 2026" },
          ].map((r) => (
            <li key={r.no} className="flex items-center justify-between p-4 sm:p-5">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{r.no} · {r.siswa}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{r.tarikh}</p>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{r.jumlah}</span>
            </li>
          ))}
        </ul>
      </div>
      )}

      {/* 3. Carta tahunan + kemajuan grup */}
      {showSummary && (
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3 w-full min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <CartaTahunan />
        </div>
        <div className="min-w-0">
          <PanelKemajuanGrup
            grup={[
              { nama: "Mevlana HE", terkumpul: 8500, sasaran: 10000 },
              { nama: "Razi HE", terkumpul: 8000, sasaran: 10000 },
              { nama: "Fatih HE", terkumpul: 8000, sasaran: 10000 },
            ]}
          />
        </div>
      </div>
      )}

      {/* 4. Bagian Utama: Filter & Tabel Status Yuran Siswa */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900 w-full min-w-0">
        {/* Toolbar Carian & Penapis */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-white dark:border-slate-800 dark:bg-slate-900 w-full min-w-0">
          {/* Carian Input */}
          <div className="relative flex-1 w-full max-w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama siswa, ID atau no. transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
            />
          </div>

          {/* Kumpulan & Status Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Filter Kumpulan (Grup) */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700 max-w-full overflow-x-auto scrollbar-none">
              {(["Semua", "Mevlana HE", "Razi HE", "Fatih HE"] as const).map((group) => (
                <button
                  type="button"
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedGroup === group
                      ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-blue-300"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Filter Status Pembayaran */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700 max-w-full overflow-x-auto scrollbar-none">
              {(["Semua", "Lunas", "Tunggakan", "Sebagian"] as const).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedStatus === status
                      ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-blue-300"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabel Data_Talebe & Transaksi_Masuk */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700">
              <tr>
                {isSiswa ? (
                  <>
                    <th scope="col" className="px-5 py-3.5">ID Siswa</th>
                    <th scope="col" className="px-5 py-3.5">Nama Siswa</th>
                    <th scope="col" className="px-5 py-3.5">Grup</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Yuran Bulanan</th>
                    <th scope="col" className="px-5 py-3.5 text-center">Status Bayaran</th>
                    <th scope="col" className="px-5 py-3.5 text-center">Aktif</th>
                    <th scope="col" className="px-5 py-3.5 text-center">Tindakan</th>
                  </>
                ) : (
                  <>
                <th scope="col" className="px-5 py-3.5">
                  ID & No. Transaksi
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Nama Siswa
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Grup
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Yuran Bulanan
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Jumlah Bayar
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Metode Pembayaran
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Tanggal
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  Tindakan
                </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isSiswa ? 7 : 9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-slate-100 p-3 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                        <Search className="size-6" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Tiada rekod dijumpai</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cuba ubah carian kata kunci atau tetapan penapis grup/status anda.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedGroup("Semua");
                          setSelectedStatus("Semua");
                        }}
                        className="mt-4 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
                      >
                        Set Semula Penapis
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
                  const baki = item.yuranBulanan - item.jumlahBayar;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => openRecordModal(item)}
                    >
                      {isSiswa ? (
                        <>
                          {/* ID Siswa */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">{item.id}</div>
                          </td>
                          {/* Nama & Grup */}
                          <td className="px-5 py-4">
                            <NamaTalebe nama={item.nama} />
                          </td>
                          {/* Grup */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                              {item.grup}
                            </span>
                          </td>
                          {/* Yuran Bulanan */}
                          <td className="px-5 py-4 text-right whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                            {formatRM(item.yuranBulanan)}
                          </td>
                          {/* Status Bayaran */}
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            {item.status === "Lunas" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/50">
                                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Lunas</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 border border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800">
                                <AlertCircle className="size-3 text-red-700 dark:text-red-400" />
                                <span>{item.status}</span>
                              </span>
                            )}
                          </td>
                          {/* Aktif */}
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.statusAktif ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/50" : "bg-slate-100 text-slate-500 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"}`}>
                              {item.statusAktif ? "Aktif" : "Tidak Aktif"}
                            </span>
                          </td>
                          {/* Tindakan */}
                          <td className="px-5 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openRecordModal(item)}
                              title="Lihat Detail"
                            >
                              <Eye className="size-4" />
                            </Button>
                          </td>
                        </>
                      ) : (
                        <>
                      {/* ID & No Transaksi */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-200">
                          {item.noTransaksi}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono dark:text-slate-500">{item.id}</div>
                      </td>

                      {/* Nama Siswa & Grup */}
                      <td className="px-5 py-4">
                        <NamaTalebe nama={item.nama} />
                      </td>
                      {/* Grup */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          {item.grup}
                        </span>
                      </td>

                      {/* Yuran Bulanan */}
                      <td className="px-5 py-4 text-right whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                        {formatRM(item.yuranBulanan)}
                      </td>

                      {/* Jumlah Bayar & Sisa */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{formatRM(item.jumlahBayar)}</div>
                        {baki > 0 && (
                          <div className="text-[11px] text-rose-600 font-medium dark:text-rose-400">
                            Sisa: {formatRM(baki)}
                          </div>
                        )}
                      </td>

                      {/* Kaedah Bayar */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                        {item.metodeBayar}
                      </td>

                      {/* Tanggal Bayaran */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {item.tanggal}
                      </td>

                      {/* Label Status Badge */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        {item.status === "Lunas" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/50">
                            <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Lunas</span>
                          </span>
                        )}

                        {item.status === "Tunggakan" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 border border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800">
                            <AlertCircle className="size-3 text-red-700 dark:text-red-400" />
                            <span>Tunggakan</span>
                          </span>
                        )}

                        {item.status === "Sebagian" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 border border-yellow-200 dark:bg-yellow-950/70 dark:text-yellow-300 dark:border-yellow-800">
                            <Clock className="size-3 text-yellow-700 dark:text-yellow-400" />
                            <span>Sebagian</span>
                          </span>
                        )}
                      </td>

                      {/* Tindakan */}
                      <td className="px-5 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openRecordModal(item)}
                          title="Lihat Detail Kuitansi"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Jadual / Paginasi Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
          <p>
            Menunjukkan <strong className="text-slate-900 dark:text-slate-200">{filteredRecords.length}</strong> daripada{" "}
            <strong className="text-slate-900 dark:text-slate-200">{records.length}</strong> catatan siswa untuk bulan{" "}
            <strong className="text-slate-900 dark:text-slate-200">{selectedMonth}</strong>.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-green-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Tingkat Penagihan Saat Ini: {persentaseKutipan.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 5. Modal / Dialog Detail Transaksi Siswa */}
      <CenterMorphModal open={recordOpen} onOpenChange={handleRecordOpenChange}>
        <CenterMorphModalContent
          ariaLabel="Detail Transaksi Siswa"
          className="max-w-lg p-6"
        >
          {selectedRecord && (
            <>
              <div className="border-b border-slate-100 pb-4 pr-10 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Kuitansi & Detail Yuran Siswa
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5 dark:text-slate-100">{selectedRecord.nama}</h3>
                <p className="text-xs text-slate-500 font-mono dark:text-slate-400">
                  {selectedRecord.noTransaksi} · {selectedRecord.id}
                </p>
              </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Grup Asrama</p>
                  <p className="font-semibold text-slate-900 mt-0.5 dark:text-slate-100">{selectedRecord.grup}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Bulan Bayaran</p>
                  <p className="font-semibold text-slate-900 mt-0.5 dark:text-slate-100">{selectedRecord.bulanDibayar}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Yuran Bulanan</p>
                  <p className="font-semibold text-slate-900 mt-0.5 dark:text-slate-100">{formatRM(selectedRecord.yuranBulanan)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Jumlah Dibayar</p>
                  <p className="font-bold text-emerald-600 mt-0.5 dark:text-emerald-400">{formatRM(selectedRecord.jumlahBayar)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Metode Pembayaran</p>
                  <p className="font-semibold text-slate-900 mt-0.5 dark:text-slate-100">{selectedRecord.metodeBayar}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal Transaksi</p>
                  <p className="font-semibold text-slate-900 mt-0.5 dark:text-slate-100">{selectedRecord.tanggal}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Status Pembayaran Semasa</span>
                {selectedRecord.status === "Lunas" && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/50">
                    Lunas Sepenuhnya
                  </span>
                )}
                {selectedRecord.status === "Tunggakan" && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 border border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800">
                    Tunggakan (Belum Bayar)
                  </span>
                )}
                {selectedRecord.status === "Sebagian" && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800 border border-yellow-200 dark:bg-yellow-950/70 dark:text-yellow-300 dark:border-yellow-800">
                    Sebagian (Sisa: {formatRM(selectedRecord.yuranBulanan - selectedRecord.jumlahBayar)})
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <CenterMorphModalClose>
                <Button variant="secondary" size="sm">
                  Tutup
                </Button>
              </CenterMorphModalClose>
              <ButtonLink
                variant="primary"
                size="sm"
                href="/admin?tab=kwitansi"
              >
                <Receipt className="size-3.5" />
                <span>Urus Kwitansi</span>
              </ButtonLink>
            </div>
            </>
          )}
        </CenterMorphModalContent>
      </CenterMorphModal>

      {/* Modal Catat Bayaran */}
      <CenterMorphModal open={showBayarModal} onOpenChange={setShowBayarModal}>
        <CenterMorphModalContent
          ariaLabel="Catat Pembayaran Baru"
          className="max-w-md p-6"
        >
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Catat Pembayaran Baru</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Catatan pembayaran yuran bulanan siswa.</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Siswa</label>
                <input
                  type="text"
                  value={bayarNama}
                  onChange={(e) => setBayarNama(e.target.value)}
                  placeholder="cth: Ahmad bin Ali"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bulan</span>
                  <MorphSelect
                    value={bayarBulan}
                    onValueChange={setBayarBulan}
                    className="mt-1 w-full"
                  >
                    <MorphSelectTrigger>
                      <MorphSelectValue placeholder="Pilih bulan" />
                    </MorphSelectTrigger>
                    <MorphSelectContent>
                      <MorphSelectItem value="Oktober 2026">Oktober 2026</MorphSelectItem>
                      <MorphSelectItem value="September 2026">September 2026</MorphSelectItem>
                      <MorphSelectItem value="Agustus 2026">Agustus 2026</MorphSelectItem>
                    </MorphSelectContent>
                  </MorphSelect>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jumlah (RM)</label>
                  <input
                    type="number"
                    value={bayarJumlah}
                    onChange={(e) => setBayarJumlah(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <CenterMorphModalClose>
                <Button variant="secondary" size="sm">
                  Batal
                </Button>
              </CenterMorphModalClose>
              <Button
                variant="primary"
                size="sm"
                ripple
                disabled={!bayarNama.trim()}
                onClick={() => {
                  const baru: TalebeRecord = {
                    id: `T-${Date.now()}`,
                    nama: bayarNama.trim(),
                    noTransaksi: `TRX-${Date.now().toString().slice(-6)}`,
                    grup: "Mevlana HE",
                    yuranBulanan: 500,
                    jumlahBayar: Number(bayarJumlah) || 500,
                    bulanDibayar: bayarBulan,
                    tanggal: "04 Okt 2026",
                    metodeBayar: "Tunai (Kaunter)",
                    status: "Lunas",
                    statusAktif: true,
                  };
                  setRecords((r) => [baru, ...r]);
                  setShowBayarModal(false);
                  window.setTimeout(() => setBayarNama(""), 460);
                }}
              >
                Simpan Bayaran
              </Button>
            </div>
        </CenterMorphModalContent>
      </CenterMorphModal>

      {/* Modal Import Siswa */}
      <CenterMorphModal open={showImportModal} onOpenChange={handleImportOpenChange}>
        <CenterMorphModalContent
          ariaLabel="Impor Data Siswa"
          className="max-w-lg p-6"
        >
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Impor Data Siswa</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Muat naik fail CSV mengikut template.{" "}
              <button
                type="button"
                onClick={() => {
                  const tpl = "Nama,Grup,Kelas,Yuran Bulanan (RM),Aktif (Ya/Tidak),Sesi\n\"Ahmad Faiz bin Rosli\",\"Mevlana HE\",\"Tingkatan 1\",500,Ya,2026/2027\n";
                  const blob = new Blob(["\uFEFF" + tpl], { type: "text/csv;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "template-import-siswa.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
              >
                Muat turun template
              </button>
            </p>
            <div className="mt-4">
              <FileUpload
                value={uploadItems}
                onValueChange={setUploadItems}
                onFilesAdded={handleImportFilesAdded}
                onRemove={handleImportRemove}
                onRetry={handleImportRetry}
                accept=".csv"
                multiple={false}
                maxFiles={1}
                variant="centered"
                title="Seret & letak fail CSV di sini"
                description="atau klik untuk pilih fail mengikut template"
                browseLabel="Pilih Fail"
              />
              {importPreview.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-50 sticky top-0 dark:bg-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2 text-left">Nama</th>
                        <th className="px-3 py-2 text-left">Grup</th>
                        <th className="px-3 py-2 text-right">Yuran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {importPreview.map((r) => (
                        <tr key={r.id}>
                          <td className="px-3 py-2">{r.nama}</td>
                          <td className="px-3 py-2">{r.grup}</td>
                          <td className="px-3 py-2 text-right">RM {r.yuranBulanan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <CenterMorphModalClose>
                <Button variant="secondary" size="sm">
                  Batal
                </Button>
              </CenterMorphModalClose>
              <Button
                variant="primary"
                size="sm"
                ripple
                disabled={importPreview.length === 0}
                onClick={confirmImport}
              >
                Import {importPreview.length > 0 ? `(${importPreview.length})` : ""}
              </Button>
            </div>
        </CenterMorphModalContent>
      </CenterMorphModal>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense>
      <AdminContent />
    </Suspense>
  );
}
