"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Calendar,
  Eye,
  RefreshCw,
} from "lucide-react";

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
  status: "Lunas" | "Tunggakan" | "Sebahagian";
  statusAktif: boolean; // Status_Aktif
}

// Pisahkan "bin/binti Fulan" ke baris bawah (tanpa grup, grup kini kolom sendiri)
function NamaTalebe({ nama }: { nama: string }) {
  const m = nama.match(/^(.*?)\s+(bin|binti|bt)\s+(.+)$/i);
  const namaUtama = m ? m[1].trim() : nama;
  const patronimik = m ? `${m[2].toLowerCase()} ${m[3].trim()}` : null;
  return (
    <>
      <div className="font-semibold text-gray-900">{namaUtama}</div>
      {patronimik && <div className="text-xs text-gray-500 mt-0.5">{patronimik}</div>}
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
    status: "Sebahagian",
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
    bulanDibayar: "Ogos 2026",
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
    bulanDibayar: "Ogos 2026",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("Semua");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [selectedMonth, setSelectedMonth] = useState("Oktober");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedRecord, setSelectedRecord] = useState<TalebeRecord | null>(null);
  const [showBayarModal, setShowBayarModal] = useState(false);
  const [bayarNama, setBayarNama] = useState("");
  const [bayarJumlah, setBayarJumlah] = useState("500");
  const [bayarBulan, setBayarBulan] = useState("Oktober 2026");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<TalebeRecord[]>([]);
  const [importError, setImportError] = useState("");

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
        bulanDibayar: `${selectedMonth} ${selectedYear}`,
        tanggal: "-",
        metodeBayar: "Belum Bayar",
        status: "Tunggakan",
        statusAktif: (aktifStr || "Ya").toLowerCase() !== "tidak",
      });
    }
    return rows;
  };

  // Penapisan rekod Talebe secara dinamik
  const filteredRecords = useMemo(() => {
    const bulanTahun = `${selectedMonth} ${selectedYear}`;
    return records.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.noTransaksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchGroup = selectedGroup === "Semua" || item.grup === selectedGroup;
      const matchStatus = selectedStatus === "Semua" || item.status === selectedStatus;
      const matchMonth = item.bulanDibayar === bulanTahun;

      return matchSearch && matchGroup && matchStatus && matchMonth;
    });
  }, [records, searchQuery, selectedGroup, selectedStatus, selectedMonth, selectedYear]);

  // Statistik Keseluruhan (KPI Math) — ikut bulan & tahun yang dipilih
  const kpiRecords = useMemo(() => {
    const bulanTahun = `${selectedMonth} ${selectedYear}`;
    return records.filter((item) => item.bulanDibayar === bulanTahun);
  }, [records, selectedMonth, selectedYear]);
  const totalTarget = kpiRecords.reduce((sum, r) => sum + r.yuranBulanan, 0);
  const totalPemasukan = kpiRecords
    .filter((r) => r.status === "Lunas")
    .reduce((sum, r) => sum + r.jumlahBayar, 0);
  const totalTunggakan = kpiRecords
    .filter((r) => r.status === "Tunggakan")
    .reduce((sum, r) => sum + (r.yuranBulanan - r.jumlahBayar), 0);
  const persentaseKutipan = totalTarget > 0 ? (totalPemasukan / totalTarget) * 100 : 0;

  // Tab yang belum ada konten khusus
  if (tab === "penugasan" || tab === "persetujuan" || tab === "penyata") {
    const titles: Record<string, string> = {
      penugasan: "Penugasan Staf",
      persetujuan: "Pengesahan Ibu Bapa",
      penyata: "Penyata Bulanan",
    };
    const title = titles[tab] ?? "Modul";
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">Bahagian ini dalam pembangunan.</p>
        </div>
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">
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
    tab === "aliran-kas" ? "Aliran Kas & Yuran"
    : tab === "siswa" ? "Data Talebe (Siswa)"
    : tab === "transaksi" ? "Transaksi Masuk"
    : tab === "resit" ? "Resit & Kwitansi"
    : "Dasbor Pentadbiran Yuran";

  const headerDesc =
    tab === "aliran-kas" ? "Ringkasan aliran tunai masuk dan keluar kas asrama."
    : tab === "siswa" ? "Senarai talebe berdaftar mengikut grup asrama."
    : tab === "transaksi" ? "Senarai semua pembayaran yuran yang diterima."
    : tab === "resit" ? "Senarai resit dan kwitansi yang telah dimuat naik."
    : "Sistem pengurusan yuran bulanan asrama Talebe, rekod kutipan kas, dan pengesahan status pembayaran.";

  return (
    <div className="space-y-8">
      {/* 1. Header Dasbor Utama & Tindakan */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {headerTitle}
            </h1>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              Aylik Talebe
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {headerDesc}
          </p>
        </div>

        {/* Butang Tindakan Cepat */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none rounded-xl border border-gray-300 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-gray-700 shadow-2xs hover:border-gray-400 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="Januari">Januari</option>
              <option value="Februari">Februari</option>
              <option value="Mac">Mac</option>
              <option value="April">April</option>
              <option value="Mei">Mei</option>
              <option value="Jun">Jun</option>
              <option value="Julai">Julai</option>
              <option value="Ogos">Ogos</option>
              <option value="September">September</option>
              <option value="Oktober">Oktober</option>
              <option value="November">November</option>
              <option value="Disember">Disember</option>
            </select>
            <Calendar className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
          </div>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none rounded-xl border border-gray-300 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-gray-700 shadow-2xs hover:border-gray-400 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            <Calendar className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
          </div>

          <button
            type="button"
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
              a.download = `yuran-${selectedMonth.toLowerCase()}-${selectedYear}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Download className="size-3.5 text-gray-500" />
            <span>Eksport Data</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Upload className="size-3.5 text-gray-500" />
            <span>Import Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBayarModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors focus-visible:outline-emerald-600"
          >
            <Plus className="size-4" />
            <span>Catat Bayaran</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Aliran Kas (tab aliran-kas sahaja) */}
      {isAliranKas && (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Jumlah Masuk</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">RM 24,500</p>
          <p className="mt-1 text-xs text-gray-500">Oktober 2026 · 49 transaksi</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Jumlah Keluar</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">RM 3,200</p>
          <p className="mt-1 text-xs text-gray-500">Oktober 2026 · perbelanjaan operasi</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Baki Bersih</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">RM 21,300</p>
          <p className="mt-1 text-xs text-gray-500">Masuk tolak keluar bulan ini</p>
        </div>
      </div>
      )}

      {/* Senarai Resit (tab resit sahaja) */}
      {isResit && (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Resit & Kwitansi Terkini</h2>
          <p className="mt-1 text-xs text-gray-500">Dokumen bukti pembayaran yang dimuat naik.</p>
        </div>
        <ul className="divide-y divide-gray-100">
          {[
            { no: "R-2026-1042", siswa: "Ahmad bin Ali", jumlah: "RM 500", tarikh: "02 Okt 2026" },
            { no: "R-2026-1041", siswa: "Siti binti Hassan", jumlah: "RM 500", tarikh: "02 Okt 2026" },
            { no: "R-2026-1040", siswa: "Mohd Rizal", jumlah: "RM 500", tarikh: "01 Okt 2026" },
          ].map((r) => (
            <li key={r.no} className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">{r.no} · {r.siswa}</p>
                <p className="mt-0.5 text-xs text-gray-500">{r.tarikh}</p>
              </div>
              <span className="text-sm font-bold text-gray-900">{r.jumlah}</span>
            </li>
          ))}
        </ul>
      </div>
      )}

      {/* 2. Empat Kotak Ringkasan KPI (KPI Cards) */}
      {showSummary && (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Total Pemasukan Kas */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Total Pemasukan Kas
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-800 border border-emerald-100">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {formatRM(totalPemasukan)}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                +12.4%
              </span>
              <span className="text-gray-500">berbanding bulan lepas</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Target Pemasukan */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Target Pemasukan
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-800 border border-blue-100">
              <Target className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {formatRM(totalTarget)}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Sasaran asas: 60 Talebe × RM 500
            </p>
          </div>
        </div>

        {/* KPI 3: Total Tunggakan */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Total Tunggakan
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-800 border border-rose-100">
              <AlertCircle className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight text-rose-600 sm:text-3xl">
              {formatRM(totalTunggakan)}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md">
                11 Siswa
              </span>
              <span className="text-gray-500">belum melunaskan yuran</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Persentase Kutipan Yuran */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Kutipan Yuran
            </span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-800 border border-indigo-100">
              <PieChart className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {persentaseKutipan.toFixed(1)}%
              </p>
              <span className="text-xs font-medium text-emerald-700">49 / 60 Lunas</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-800 transition-all duration-500"
                style={{ width: `${persentaseKutipan}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 3. Ringkasan Pantas Berdasarkan Grup Asrama (Aylik Talebe Groups) */}
      {showSummary && (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900">Mevlana HE</span>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              85% Selesai
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">Kutipan: RM 8,500 / RM 10,000 (20 Talebe)</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900">Razi HE</span>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              80% Selesai
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">Kutipan: RM 8,000 / RM 10,000 (20 Talebe)</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900">Fatih HE</span>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              80% Selesai
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">Kutipan: RM 8,000 / RM 10,000 (20 Talebe)</p>
        </div>
      </div>
      )}

      {/* 4. Bahagian Utama: Penapis & Tabel Status Yuran Talebe */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        {/* Toolbar Carian & Penapis */}
        <div className="p-5 border-b border-gray-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white">
          {/* Carian Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama talebe, ID atau no. transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:border-emerald-600 focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          {/* Kumpulan & Status Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kumpulan (Grup) */}
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 border border-gray-200/80">
              {(["Semua", "Mevlana HE", "Razi HE", "Fatih HE"] as const).map((group) => (
                <button
                  type="button"
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedGroup === group
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Filter Status Pembayaran */}
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 border border-gray-200/80">
              {(["Semua", "Lunas", "Tunggakan", "Sebahagian"] as const).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedStatus === status
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabel Data_Talebe & Transaksi_Masuk */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                {isSiswa ? (
                  <>
                    <th scope="col" className="px-5 py-3.5">ID Talebe</th>
                    <th scope="col" className="px-5 py-3.5">Nama Talebe</th>
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
                  Nama Talebe
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
                  Kaedah Bayaran
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Tarikh
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
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isSiswa ? 7 : 9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-gray-100 p-3 text-gray-400">
                        <Search className="size-6" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-gray-900">Tiada rekod dijumpai</p>
                      <p className="text-xs text-gray-500">
                        Cuba ubah carian kata kunci atau tetapan penapis grup/status anda.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedGroup("Semua");
                          setSelectedStatus("Semua");
                        }}
                        className="mt-4 text-xs font-semibold text-emerald-800 hover:underline"
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
                      className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRecord(item)}
                    >
                      {isSiswa ? (
                        <>
                          {/* ID Talebe */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="font-mono text-xs font-semibold text-gray-900">{item.id}</div>
                          </td>
                          {/* Nama & Grup */}
                          <td className="px-5 py-4">
                            <NamaTalebe nama={item.nama} />
                          </td>
                          {/* Grup */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-xs font-medium text-emerald-800">
                              {item.grup}
                            </span>
                          </td>
                          {/* Yuran Bulanan */}
                          <td className="px-5 py-4 text-right whitespace-nowrap font-medium text-gray-900">
                            {formatRM(item.yuranBulanan)}
                          </td>
                          {/* Status Bayaran */}
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            {item.status === "Lunas" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 border border-green-200">
                                <CheckCircle2 className="size-3 text-green-700" />
                                <span>Lunas</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 border border-red-200">
                                <AlertCircle className="size-3 text-red-700" />
                                <span>{item.status}</span>
                              </span>
                            )}
                          </td>
                          {/* Aktif */}
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.statusAktif ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}`}>
                              {item.statusAktif ? "Aktif" : "Tidak Aktif"}
                            </span>
                          </td>
                          {/* Tindakan */}
                          <td className="px-5 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedRecord(item)}
                              className="inline-flex items-center gap-1 rounded-lg p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                              title="Lihat Butiran"
                            >
                              <Eye className="size-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                      {/* ID & No Transaksi */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-semibold text-gray-900">
                          {item.noTransaksi}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">{item.id}</div>
                      </td>

                      {/* Nama Talebe & Grup */}
                      <td className="px-5 py-4">
                        <NamaTalebe nama={item.nama} />
                      </td>
                      {/* Grup */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-emerald-800">
                          {item.grup}
                        </span>
                      </td>

                      {/* Yuran Bulanan */}
                      <td className="px-5 py-4 text-right whitespace-nowrap font-medium text-gray-900">
                        {formatRM(item.yuranBulanan)}
                      </td>

                      {/* Jumlah Bayar & Baki */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{formatRM(item.jumlahBayar)}</div>
                        {baki > 0 && (
                          <div className="text-[11px] text-rose-600 font-medium">
                            Baki: {formatRM(baki)}
                          </div>
                        )}
                      </td>

                      {/* Kaedah Bayar */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-600">
                        {item.metodeBayar}
                      </td>

                      {/* Tarikh Bayaran */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                        {item.tanggal}
                      </td>

                      {/* Label Status Badge (Hijau Muda utk Lunas, Merah/Kuning utk Tunggakan/Sebahagian) */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        {item.status === "Lunas" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 border border-green-200">
                            <CheckCircle2 className="size-3 text-green-700" />
                            <span>Lunas</span>
                          </span>
                        )}

                        {item.status === "Tunggakan" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 border border-red-200">
                            <AlertCircle className="size-3 text-red-700" />
                            <span>Tunggakan</span>
                          </span>
                        )}

                        {item.status === "Sebahagian" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 border border-yellow-200">
                            <Clock className="size-3 text-yellow-700" />
                            <span>Sebahagian</span>
                          </span>
                        )}
                      </td>

                      {/* Tindakan */}
                      <td className="px-5 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(item)}
                          className="inline-flex items-center gap-1 rounded-lg p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                          title="Lihat Butiran Resit"
                        >
                          <Eye className="size-4" />
                        </button>
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
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            Menunjukkan <strong className="text-gray-900">{filteredRecords.length}</strong> daripada{" "}
            <strong className="text-gray-900">{records.length}</strong> rekod Talebe bagi bulan{" "}
            <strong className="text-gray-900">{selectedMonth} {selectedYear}</strong>.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-green-500" />
            <span className="font-medium text-gray-700">Kadar Kutipan Semasa: {persentaseKutipan.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 5. Modal / Dialog Butiran Transaksi Talebe */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-gray-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Resit & Butiran Yuran Talebe
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">{selectedRecord.nama}</h3>
                <p className="text-xs text-gray-500 font-mono">
                  {selectedRecord.noTransaksi} · {selectedRecord.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Grup Asrama</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedRecord.grup}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bulan Bayaran</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedRecord.bulanDibayar}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Yuran Bulanan</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{formatRM(selectedRecord.yuranBulanan)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Jumlah Dibayar</p>
                  <p className="font-bold text-emerald-800 mt-0.5">{formatRM(selectedRecord.jumlahBayar)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kaedah Bayaran</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedRecord.metodeBayar}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tarikh Transaksi</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedRecord.tanggal}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                <span className="text-xs font-medium text-gray-600">Status Pembayaran Semasa</span>
                {selectedRecord.status === "Lunas" && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800 border border-green-200">
                    Lunas Sepenuhnya
                  </span>
                )}
                {selectedRecord.status === "Tunggakan" && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 border border-red-200">
                    Tunggakan (Belum Bayar)
                  </span>
                )}
                {selectedRecord.status === "Sebahagian" && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800 border border-yellow-200">
                    Sebahagian (Baki: {formatRM(selectedRecord.yuranBulanan - selectedRecord.jumlahBayar)})
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </button>
              <Link
                href="/admin?tab=kwitansi"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 shadow-xs"
              >
                <Receipt className="size-3.5" />
                <span>Urus Kwitansi</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catat Bayaran */}
      {showBayarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Catat Bayaran Baru</h2>
            <p className="mt-1 text-xs text-gray-500">Rekod pembayaran yuran bulanan talebe.</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700">Nama Talebe</label>
                <input
                  type="text"
                  value={bayarNama}
                  onChange={(e) => setBayarNama(e.target.value)}
                  placeholder="cth: Ahmad bin Ali"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Bulan</label>
                  <select
                    value={bayarBulan}
                    onChange={(e) => setBayarBulan(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  >
                    <option>Oktober 2026</option>
                    <option>September 2026</option>
                    <option>Ogos 2026</option>
                    <option>Oktober 2025</option>
                    <option>Ogos 2025</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Jumlah (RM)</label>
                  <input
                    type="number"
                    value={bayarJumlah}
                    onChange={(e) => setBayarJumlah(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBayarModal(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
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
                    tanggal: `04 ${bayarBulan
                      .replace("Oktober", "Okt")
                      .replace("September", "Sep")}`,
                    metodeBayar: "Tunai (Kaunter)",
                    status: "Lunas",
                    statusAktif: true,
                  };
                  setRecords((r) => [baru, ...r]);
                  setBayarNama("");
                  setShowBayarModal(false);
                }}
                className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"
              >
                Simpan Bayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Siswa */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Import Data Siswa</h2>
            <p className="mt-1 text-xs text-gray-500">
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
                className="font-semibold text-emerald-700 hover:underline"
              >
                Muat turun template
              </button>
            </p>
            <div className="mt-4">
              <label className="block rounded-xl border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-emerald-500">
                <Upload className="mx-auto size-6 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-700">Klik untuk pilih fail CSV</p>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const rows = parseImportCSV(String(reader.result ?? ""));
                        setImportPreview(rows);
                        setImportError("");
                      } catch (err) {
                        setImportError(err instanceof Error ? err.message : "Gagal membaca fail.");
                        setImportPreview([]);
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {importError && <p className="mt-2 text-xs font-medium text-rose-600">{importError}</p>}
              {importPreview.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-gray-200">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Nama</th>
                        <th className="px-3 py-2 text-left">Grup</th>
                        <th className="px-3 py-2 text-right">Yuran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
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
              <button
                type="button"
                onClick={() => { setShowImportModal(false); setImportPreview([]); setImportError(""); }}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={importPreview.length === 0}
                onClick={() => {
                  setRecords((r) => [...importPreview, ...r]);
                  setShowImportModal(false);
                  setImportPreview([]);
                }}
                className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"
              >
                Import {importPreview.length > 0 ? `(${importPreview.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
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
