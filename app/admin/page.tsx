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
  Eye,
  RefreshCw,
} from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import * as XLSX from "xlsx";
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
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../../components/ui/combobox";
import { Item, ItemContent, ItemDescription, ItemTitle } from "../../components/ui/item";
import { DataTable } from "../../components/data-table/data-table";
import { DataTableColumnHeader } from "../../components/data-table/data-table-column-header";
import type { DataTableFeatures } from "../../components/data-table/data-table-features";
import { FinanceHero } from "../../components/finance-hero";
import { FinanceKpi } from "../../components/finance-kpi";
import { CartaTahunan, PanelKemajuanGrup } from "../../components/finance-charts";

/** Ringkasan siswa untuk combobox (nama + grup) */
interface SiswaRingkas {
  id: string;
  nama: string;
  grup: string;
}

const columnHelper = createColumnHelper<DataTableFeatures, SiswaRecord>();

const BULAN_KE_INDEKS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
};

/** Ubah "04 Okt 2026" menjadi timestamp untuk susunan kronologi. */
function tanggalKeTimestamp(tanggal: string): number {
  const m = tanggal.match(/^(\d{1,2})\s+(\w{3})\s+(\d{4})$/);
  if (!m) return -1;
  const indeks = BULAN_KE_INDEKS[m[2]];
  if (indeks === undefined) return -1;
  return new Date(Number(m[3]), indeks, Number(m[1])).getTime();
}

/** Lencana status untuk varian tabel transaksi. */
function LencanaStatus({ status }: { status: SiswaRecord["status"] }) {
  if (status === "Lunas") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
        <CheckCircle2 className="size-3 text-emerald-600" />
        <span>Lunas</span>
      </span>
    );
  }
  if (status === "Tunggakan") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 border border-red-200">
        <AlertCircle className="size-3 text-red-700" />
        <span>Tunggakan</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 border border-yellow-200">
      <Clock className="size-3 text-yellow-700" />
      <span>Sebagian</span>
    </span>
  );
}

/** Lencana status untuk varian senarai siswa (Lunas hijau, selebihnya merah). */
function LencanaStatusSiswa({ status }: { status: SiswaRecord["status"] }) {
  if (status === "Lunas") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
        <CheckCircle2 className="size-3 text-emerald-600" />
        <span>Lunas</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 border border-red-200">
      <AlertCircle className="size-3 text-red-700" />
      <span>{status}</span>
    </span>
  );
}

/** Lencana keaktifan siswa. */
function LencanaAktif({ aktif }: { aktif: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${aktif ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-muted text-muted-foreground border border-border/60"}`}>
      {aktif ? "Aktif" : "Tidak Aktif"}
    </span>
  );
}

// Struktur jenis data berasaskan skema logik Data_Siswa & Transaksi_Masuk
export interface SiswaRecord {
  id: string; // ID_Siswa (PK)
  noTransaksi: string; // No_Transaksi (PK)
  nama: string; // Nama_Siswa
  kelas: string; // Kelas
  grup: string; // Grup
  yuranBulanan: number; // Yuran_Bulanan (Default RM 500)
  yuranPendaftaran: number; // Yuran_Pendaftaran_Tahunan (Default RM 1000)
  jumlahBayar: number; // Jumlah_Bayar
  bulanDibayar: string; // Bulan_Dibayar
  tanggal: string; // Tanggal
  metodeBayar: "Online Transfer (FPX)" | "DuitNow QR" | "Tunai (Kaunter)" | "Bank Transfer" | "Belum Bayar";
  status: "Lunas" | "Tunggakan" | "Sebagian";
  statusAktif: boolean; // Status_Aktif
  jenisYuran?: "bulanan" | "pendaftaran"; // Jenis yuran: bulanan atau pendaftaran tahunan
}

// Pisahkan "bin/binti Fulan" ke baris bawah (tanpa grup, grup kini kolom sendiri)
function NamaSiswa({ nama }: { nama: string }) {
  const m = nama.match(/^(.*?)\s+(bin|binti|bt)\s+(.+)$/i);
  const namaUtama = m ? m[1].trim() : nama;
  const patronimik = m ? `${m[2].toLowerCase()} ${m[3].trim()}` : null;
  return (
    <>
      <div className="font-semibold text-foreground">{namaUtama}</div>
      {patronimik && <div className="text-xs text-muted-foreground mt-0.5">{patronimik}</div>}
    </>
  );
}

// Data asli dari spreadsheet "Aylik Talebe 2026" — 111 siswa x 12 bulan = 1332 records
const initialSiswaData: SiswaRecord[] = [];

// Helper pemformatan mata wang Ringgit Malaysia
function formatRM(amount: number): string {
  return `RM ${amount.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function AdminContent() {
  const searchParams = useSearchParams();
  const tab = searchParams ? searchParams.get("tab") : null;

  const [records, setRecords] = useState<SiswaRecord[]>(initialSiswaData);
  const qParam = (searchParams ? searchParams.get("q") : null) ?? "";
  const [searchQuery, setSearchQuery] = useState(qParam);
  // Segerakkan carian jadual apabila carian global header menghantar ?q=
  useEffect(() => {
    setSearchQuery(qParam);
  }, [qParam]);
  const [selectedGroup, setSelectedGroup] = useState<string>("Semua");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2026");
  const [selectedRecord, setSelectedRecord] = useState<SiswaRecord | null>(null);
  const [recordOpen, setRecordOpen] = useState(false);
  const recordCloseTimer = useRef<number | null>(null);
  const [showBayarModal, setShowBayarModal] = useState(false);
  const [bayarSiswa, setBayarSiswa] = useState<SiswaRingkas | null>(null);
  // Senarai unik siswa (nama + grup) untuk combobox — diperoleh dari rekod sedia ada
  // Data bulanan untuk chart — agregasi jumlahBayar per bulan dari records
  const dataBulananChart = useMemo(() => {
    const bulanMap: Record<string, number> = {
      "Januari": 0, "Februari": 1, "Maret": 2, "April": 3, "Mei": 4, "Juni": 5,
      "Juli": 6, "Agustus": 7, "September": 8, "Oktober": 9, "November": 10, "Desember": 11,
    };
    const hasil = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (const r of records) {
      const parts = r.bulanDibayar.split(" ");
      const idx = bulanMap[parts[0]];
      if (idx !== undefined) hasil[idx] += r.jumlahBayar;
    }
    return hasil;
  }, [records]);

  // Kemajuan per grup — terkumpul vs sasaran dari records
  const kemajuanGrup = useMemo(() => {
    const map = new Map<string, { terkumpul: number; sasaran: number }>();
    for (const r of records) {
      const g = map.get(r.grup) ?? { terkumpul: 0, sasaran: 0 };
      g.terkumpul += r.jumlahBayar;
      g.sasaran += r.yuranBulanan;
      map.set(r.grup, g);
    }
    return [...map.entries()].map(([nama, v]) => ({ nama, ...v }));
  }, [records]);

  const daftarSiswa = useMemo(() => {
    const map = new Map<string, SiswaRingkas>();
    for (const r of records) {
      if (!map.has(r.nama)) map.set(r.nama, { id: r.id, nama: r.nama, grup: r.grup });
    }
    return [...map.values()];
  }, [records]);
  const [bayarJumlah, setBayarJumlah] = useState("500");
  const [bayarBulan, setBayarBulan] = useState("Oktober 2026");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<SiswaRecord[]>([]);
  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);

  // Parse CSV import siswa: Nama,Grup,Kelas,Yuran Bulanan (RM),Aktif (Ya/Tidak),Sesi
  const parseImportCSV = (text: string): SiswaRecord[] => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new Error("Fail kosong atau tiada data.");
    const rows: SiswaRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      // Split CSV menghormati tanda petik
      const cols = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map((c) => c.replace(/^"|"$/g, "").trim()) ?? [];
      const [nama, grup, kelas, yuranStr, aktifStr] = cols;
      if (!nama) throw new Error(`Baris ${i + 1}: Nama wajib diisi.`);
      const yuran = Number(yuranStr);
      if (!yuranStr || isNaN(yuran) || yuran < 0) throw new Error(`Baris ${i + 1}: Yuran Bulanan tidak valid.`);
      rows.push({
        id: `T-IMP-${Date.now()}-${i}`,
        nama,
        noTransaksi: "-",
        kelas: (kelas || "-"),
        grup: (grup || "Umum"),
        yuranBulanan: yuran,
        yuranPendaftaran: 1000,
        jenisYuran: "bulanan",
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
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
        const rows = parseImportExcel(json);
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
    reader.readAsArrayBuffer(file);
  };

  // Parse data Excel template Data Siswa: ID, Nama, Kelas, Grup, Yuran Bulanan, Pendaftaran, Status
  const parseImportExcel = (json: Record<string, any>[]): SiswaRecord[] => {
    if (json.length === 0) throw new Error("Fail kosong atau tiada data.");
    const rows: SiswaRecord[] = [];
    json.forEach((row, i) => {
      const nama = String(row["Nama"] ?? "").trim();
      if (!nama) throw new Error(`Baris ${i + 2}: Nama wajib diisi.`);
      const yuran = Number(row["Yuran Bulanan"] ?? 0);
      if (isNaN(yuran) || yuran < 0) throw new Error(`Baris ${i + 2}: Yuran Bulanan tidak valid.`);
      const pendaftaran = Number(row["Pendaftaran"] ?? 1000);
      rows.push({
        id: String(row["ID"] ?? `T-IMP-${Date.now()}-${i}`),
        nama,
        noTransaksi: "-",
        kelas: String(row["Kelas"] ?? "-").trim() || "-",
        grup: String(row["Grup"] ?? "Umum").trim() || "Umum",
        yuranBulanan: yuran,
        yuranPendaftaran: isNaN(pendaftaran) ? 1000 : pendaftaran,
        jumlahBayar: 0,
        bulanDibayar: selectedMonth,
        tanggal: "-",
        metodeBayar: "Belum Bayar",
        status: "Tunggakan",
        statusAktif: String(row["Status"] ?? "Aktif").toLowerCase() !== "tidak aktif",
        jenisYuran: "bulanan",
      });
    });
    return rows;
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

  const openRecordModal = useCallback((item: SiswaRecord) => {
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

  // Penapisan rekod Siswa secara dinamik
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

  // Definisi lajur TanStack Table — varian transaksi
  const transaksiColumns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("noTransaksi", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="No Transaksi" />,
          cell: ({ row }) => (
            <div className="whitespace-nowrap font-mono text-xs font-semibold text-foreground">
              {row.original.noTransaksi}
            </div>
          ),
          sortFn: "alphanumeric",
        }),
        columnHelper.accessor("nama", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
          cell: ({ row }) => <NamaSiswa nama={row.original.nama} />,
          sortFn: "text",
        }),
        columnHelper.accessor("grup", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Grup" />,
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-xs font-medium text-primary">
              {row.original.grup}
            </span>
          ),
          sortFn: "text",
        }),
        columnHelper.accessor((row) => row.jenisYuran === "pendaftaran" ? `Pendaftaran ${row.bulanDibayar}` : `Yuran ${row.bulanDibayar}`, {
          id: "keteranganYuran",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Yuran" />,
          cell: ({ row }) => {
            const isPendaftaran = row.original.jenisYuran === "pendaftaran";
            const label = isPendaftaran
              ? `Pendaftaran Tahunan ${row.original.bulanDibayar}`
              : `Yuran ${row.original.bulanDibayar}`;
            return (
              <span className="whitespace-nowrap text-xs font-medium text-foreground">
                {label}
              </span>
            );
          },
          sortFn: "text",
        }),
        columnHelper.accessor("jumlahBayar", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Jumlah Bayar" align="right" />,
          cell: ({ row }) => {
            const target = row.original.jenisYuran === "pendaftaran"
              ? row.original.yuranPendaftaran
              : row.original.yuranBulanan;
            const lebihan = row.original.jumlahBayar - target;
            return (
              <div className="whitespace-nowrap text-right">
                <div className="font-semibold text-foreground">
                  {formatRM(row.original.jumlahBayar)}
                </div>
                {lebihan > 0 && (
                  <div className="text-[11px] text-emerald-600 font-medium">
                    +{formatRM(lebihan)} baki
                  </div>
                )}
              </div>
            );
          },
          sortFn: "basic",
        }),
        columnHelper.accessor((row) => tanggalKeTimestamp(row.tanggal), {
          id: "tanggal",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {row.original.tanggal}
            </span>
          ),
          sortFn: "basic",
        }),
        columnHelper.accessor("metodeBayar", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Metode" />,
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {row.original.metodeBayar}
            </span>
          ),
          sortFn: "text",
        }),
        columnHelper.accessor("status", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Status" align="center" />,
          cell: ({ row }) => <div className="whitespace-nowrap text-center"><LencanaStatus status={row.original.status} /></div>,
          sortFn: "text",
        }),
      ]),
    []
  );

  // Definisi lajur TanStack Table — varian senarai siswa
  const siswaColumns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("id", {
          header: "ID",
          cell: ({ row }) => (
            <div className="whitespace-nowrap font-mono text-xs font-semibold text-foreground">
              {row.original.id}
            </div>
          ),
          sortFn: "alphanumeric",
        }),
        columnHelper.accessor("nama", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
          cell: ({ row }) => <NamaSiswa nama={row.original.nama} />,
          sortFn: "text",
        }),
        columnHelper.accessor("kelas", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Kelas" />,
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {row.original.kelas || "-"}
            </span>
          ),
          sortFn: "text",
        }),
        columnHelper.accessor("grup", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Grup" />,
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-xs font-medium text-primary">
              {row.original.grup}
            </span>
          ),
          sortFn: "text",
        }),
        columnHelper.accessor("yuranBulanan", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Yuran Bulanan" align="right" />,
          cell: ({ row }) => (
            <div className="whitespace-nowrap text-right font-medium text-foreground">
              {formatRM(row.original.yuranBulanan)}
            </div>
          ),
          sortFn: "basic",
        }),
        columnHelper.accessor("yuranPendaftaran", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Pendaftaran" align="right" />,
          cell: ({ row }) => (
            <div className="whitespace-nowrap text-right font-medium text-foreground">
              {formatRM(row.original.yuranPendaftaran)}
            </div>
          ),
          sortFn: "basic",
        }),
        columnHelper.accessor("status", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Status" align="center" />,
          cell: ({ row }) => <div className="whitespace-nowrap text-center"><LencanaStatusSiswa status={row.original.status} /></div>,
          sortFn: "text",
        }),
      ]),
    []
  );

  // Keadaan kosong tabel (carian/penapis tidak sepadan)
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        <Search className="size-6" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">Tidak ada data ditemukan</p>
      <p className="text-xs text-muted-foreground">
        Coba ubah kata kunci pencarian atau pengaturan filter grup/status Anda.
      </p>
      <button type="button" onClick={() => {
          setSearchQuery("");
          setSelectedGroup("Semua");
          setSelectedStatus("Semua");
        }}
        className="mt-4 text-xs font-semibold text-primary hover:underline"
      >
        Atur Ulang Filter
      </button>
    </div>
  );

  // Statistik Keseluruhan (KPI) — dihitung dari data bulan terpilih
  const dataBulanIni = initialSiswaData.filter((r) => r.bulanDibayar === selectedMonth);
  const totalTarget = dataBulanIni.reduce((s, r) => s + r.yuranBulanan, 0);
  const totalPemasukan = dataBulanIni
    .filter((r) => r.status === "Lunas")
    .reduce((s, r) => s + r.jumlahBayar, 0);
  const totalTunggakan = totalTarget - totalPemasukan;
  const persentaseKutipan = totalTarget > 0 ? (totalPemasukan / totalTarget) * 100 : 0;
  const jumlahLunas = dataBulanIni.filter((r) => r.status === "Lunas").length;

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
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bahagian ini dalam pembangunan.</p>
        </div>
        <div className="rounded-2xl border border-dashed border-input bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Modul {title} akan disambungkan ke data sebenar tidak lama lagi.
          </p>
        </div>
      </div>
    );
  }

  const isDashboard = !tab;
  const isTransaksi = tab === "transaksi";
  const isResit = tab === "resit";
  const isSiswa = tab === "siswa";
  // Untuk tab fokus jadual, sorokkan ringkasan KPI/grup supaya fokus pada kandungan tab
  const showSummary = isDashboard;

  const headerTitle =
    tab === "siswa" ? "Data Siswa"
    : tab === "transaksi" ? "Transaksi Masuk"
    : tab === "resit" ? "Kuitansi"
    : "Dasbor Administrasi Yuran";

  const headerDesc =
    tab === "siswa" ? "Daftar siswa terdaftar berdasarkan grup asrama."
    : tab === "transaksi" ? "Daftar semua pembayaran yuran yang diterima."
    : tab === "resit" ? "Daftar kuitansi yang telah diunggah."
    : "Sistem pengelolaan yuran bulanan asrama siswa, pencatatan penerimaan kas, dan persetujuan status pembayaran.";

  const quickActions = (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-auto">
                <MorphSelect value={selectedMonth}
                  onValueChange={setSelectedMonth}
                  className="w-full text-xs font-semibold sm:w-auto sm:min-w-48"
                >
                  <MorphSelectTrigger>
                    <MorphSelectValue placeholder="Pilih bulan" />
                  </MorphSelectTrigger>
                  <MorphSelectContent>
                    <MorphSelectItem value="Desember 2026">Bulan: Desember 2026</MorphSelectItem>
                    <MorphSelectItem value="November 2026">Bulan: November 2026</MorphSelectItem>
                    <MorphSelectItem value="Oktober 2026">Bulan: Oktober 2026</MorphSelectItem>
                    <MorphSelectItem value="September 2026">Bulan: September 2026</MorphSelectItem>
                    <MorphSelectItem value="Agustus 2026">Bulan: Agustus 2026</MorphSelectItem>
                    <MorphSelectItem value="Juli 2026">Bulan: Juli 2026</MorphSelectItem>
                    <MorphSelectItem value="Juni 2026">Bulan: Juni 2026</MorphSelectItem>
                    <MorphSelectItem value="Mei 2026">Bulan: Mei 2026</MorphSelectItem>
                    <MorphSelectItem value="April 2026">Bulan: April 2026</MorphSelectItem>
                    <MorphSelectItem value="Maret 2026">Bulan: Maret 2026</MorphSelectItem>
                    <MorphSelectItem value="Februari 2026">Bulan: Februari 2026</MorphSelectItem>
                    <MorphSelectItem value="Januari 2026">Bulan: Januari 2026</MorphSelectItem>
                  </MorphSelectContent>
                </MorphSelect>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="secondary" size="sm" className="flex-1 sm:flex-initial" onClick={() => {
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

                <Button variant="secondary" size="sm" className="flex-1 sm:flex-initial" onClick={() => setShowImportModal(true)}
                >
                  <Upload className="size-3.5" />
                  <span>Impor</span>
                </Button>
              </div>

              <Button variant="primary" size="sm" ripple className="w-full sm:w-auto whitespace-nowrap" onClick={() => setShowBayarModal(true)}
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
        <FinanceHero name="Admin" subtitle="Dapatkan gambaran jelas tentang kinerja keuangan dan transaksi terkini." actions={quickActions}
        >
          <FinanceKpi icon={TrendingUp}
            tone="violet" value={formatRM(totalPemasukan)}
            label="Total pemasukan bulan ini"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {jumlahLunas} siswa
              </span>
              <span className="text-xs text-muted-foreground">sudah lunas bulan ini</span>
            </div>
          </FinanceKpi>
          <FinanceKpi icon={Target}
            tone="green" value={formatRM(totalTarget)}
            label="Target pemasukan bulanan"
          >
            <p className="text-xs text-muted-foreground">Target dasar: {dataBulanIni.length} Siswa</p>
          </FinanceKpi>
          <FinanceKpi icon={AlertCircle}
            tone="pink" value={formatRM(totalTunggakan)}
            label="Total tunggakan"
          >
            <span className="inline-flex w-fit rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
              {dataBulanIni.length - jumlahLunas} Siswa belum bayar
            </span>
          </FinanceKpi>
          <FinanceKpi icon={PieChart}
            tone="blue" value={`${persentaseKutipan.toFixed(1)}%`}
            label="Tingkat penagihan yuran"
          >
            <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Number(persentaseKutipan.toFixed(1))}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Kemajuan penagihan"
            >
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${persentaseKutipan.toFixed(1)}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{jumlahLunas}/{dataBulanIni.length} Lunas</p>
          </FinanceKpi>
        </FinanceHero>
      ) : (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              {headerTitle}
            </h1>
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary border border-primary/30">
              Yuran Bulanan
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {headerDesc}
          </p>
        </div>

        {quickActions}
      </div>
      )}

      {/* Ringkasan Aliran Kas (tab aliran-kas sahaja) */}

      {/* Daftar Kuitansi (tab kuitansi sahaja) */}
      {isResit && (
      <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden w-full min-w-0">
        <div className="p-4 sm:p-5 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Kuitansi Terkini</h2>
          <p className="mt-1 text-xs text-muted-foreground">Dokumen bukti pembayaran yang dimuat naik.</p>
        </div>
        <div className="p-12 text-center">
          <p className="text-sm font-semibold text-foreground">Belum ada kuitansi</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Kuitansi akan tampil di sini setelah ada transaksi.
          </p>
        </div>
      </div>
      )}

      {/* 3. Carta tahunan + kemajuan grup */}
      {showSummary && (
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3 w-full min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <CartaTahunan dataBulanan={dataBulananChart} />
        </div>
        <div className="min-w-0">
          <PanelKemajuanGrup grup={kemajuanGrup} />
        </div>
      </div>
      )}

      {/* 4. Bagian Utama: Filter & Tabel Status Yuran Siswa */}
      <div className="rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden w-full min-w-0">
        {/* Toolbar Carian & Penapis */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-card w-full min-w-0">
          {/* Carian Input */}
          <div className="relative flex-1 w-full max-w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input type="text" placeholder="Cari nama siswa, ID atau no. transaksi..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-input bg-muted/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-hidden transition-all"
            />
          </div>

          {/* Kumpulan & Status Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Filter Kumpulan (Grup) */}
            <div className="flex items-center gap-1 rounded-xl bg-muted p-1 border border-border/80 max-w-full overflow-x-auto scrollbar-none">
              {(["Semua", "Adhwa HE", "Adnan HE ve Syukri HE", "Ameer HE", "Arif HE", "Azwar HE", "Herian HE", "Mevlana HE", "Razi HE", "Rizky HE", "Tamimi HE"] as const).map((group) => (
                <button type="button" key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedGroup === group
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Filter Status Pembayaran */}
            <div className="flex items-center gap-1 rounded-xl bg-muted p-1 border border-border/80 max-w-full overflow-x-auto scrollbar-none">
              {(["Semua", "Lunas", "Tunggakan", "Sebagian"] as const).map((status) => (
                <button type="button" key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedStatus === status
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Transaksi Masuk */}
        {isTransaksi && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
            <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Pemasukan</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600">
                {formatRM(records.reduce((s, r) => s + r.jumlahBayar, 0))}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{records.length} transaksi</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Yuran Bulanan</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
                {formatRM(records.filter((r) => r.jenisYuran !== "pendaftaran").reduce((s, r) => s + r.jumlahBayar, 0))}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {records.filter((r) => r.jenisYuran !== "pendaftaran").length} transaksi
              </p>
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pendaftaran Tahunan</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
                {formatRM(records.filter((r) => r.jenisYuran === "pendaftaran").reduce((s, r) => s + r.jumlahBayar, 0))}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {records.filter((r) => r.jenisYuran === "pendaftaran").length} transaksi
              </p>
            </div>
          </div>
        )}

        {/* Tabel Data_Siswa & Transaksi_Masuk */}
        <DataTable columns={isSiswa ? siswaColumns : transaksiColumns}
          data={filteredRecords}
          onRowClick={openRecordModal}
          emptyState={emptyState}
        />

        {/* Footer Jadual / Paginasi Info */}
        <div className="p-4 border-t border-border bg-muted/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            Menunjukkan <strong className="text-foreground">{filteredRecords.length}</strong> dari{" "}
            <strong className="text-foreground">{records.length}</strong> catatan siswa untuk bulan{" "}
            <strong className="text-foreground">{selectedMonth}</strong>.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-green-500" />
            <span className="font-medium text-foreground">Tingkat Penagihan Saat Ini: {persentaseKutipan.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 5. Modal / Dialog Detail Transaksi Siswa */}
      <CenterMorphModal open={recordOpen} onOpenChange={handleRecordOpenChange}>
        <CenterMorphModalContent ariaLabel="Detail Transaksi Siswa" className="max-w-lg p-6"
        >
          {selectedRecord && (
            <>
              <div className="border-b border-border pb-4 pr-10">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Kuitansi & Detail Yuran Siswa
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{selectedRecord.nama}</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {selectedRecord.noTransaksi} · {selectedRecord.id}
                </p>
              </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted p-4 border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Grup Asrama</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedRecord.grup}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bulan Bayaran</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedRecord.bulanDibayar}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Yuran Bulanan</p>
                  <p className="font-semibold text-foreground mt-0.5">{formatRM(selectedRecord.yuranBulanan)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Jumlah Dibayar</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{formatRM(selectedRecord.jumlahBayar)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Metode Pembayaran</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedRecord.metodeBayar}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal Transaksi</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedRecord.tanggal}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                <span className="text-xs font-medium text-muted-foreground">Status Pembayaran Semasa</span>
                {selectedRecord.status === "Lunas" && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/80">
                    Lunas Sepenuhnya
                  </span>
                )}
                {selectedRecord.status === "Tunggakan" && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 border border-red-200">
                    Tunggakan (Belum Bayar)
                  </span>
                )}
                {selectedRecord.status === "Sebagian" && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800 border border-yellow-200">
                    Sebagian (Sisa: {formatRM(selectedRecord.yuranBulanan - selectedRecord.jumlahBayar)})
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
              <CenterMorphModalClose>
                <Button variant="secondary" size="sm">
                  Tutup
                </Button>
              </CenterMorphModalClose>
              <ButtonLink variant="primary" size="sm" href="/admin?tab=kwitansi"
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
        <CenterMorphModalContent ariaLabel="Catat Pembayaran Baru" className="max-w-md p-6"
        >
            <h2 className="text-lg font-bold text-foreground">Catat Pembayaran Baru</h2>
            <p className="mt-1 text-xs text-muted-foreground">Catatan pembayaran yuran bulanan siswa.</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Nama Siswa</label>
                <Combobox items={daftarSiswa}
                  itemToStringValue={(s) => s.nama}
                  value={bayarSiswa}
                  onValueChange={setBayarSiswa}
                  className="mt-1"
                >
                  <ComboboxInput placeholder="Cari nama siswa..." className="rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Tidak ada siswa ditemukan.</ComboboxEmpty>
                    <ComboboxList>
                      {(siswa: SiswaRingkas) => (
                        <ComboboxItem key={siswa.id}>
                          <Item className="p-0">
                            <ItemContent>
                              <ItemTitle className="whitespace-nowrap">{siswa.nama}</ItemTitle>
                              <ItemDescription>{siswa.grup}</ItemDescription>
                            </ItemContent>
                          </Item>
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-semibold text-foreground">Bulan</span>
                  <MorphSelect value={bayarBulan}
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
                  <label className="text-xs font-semibold text-foreground">Jumlah (RM)</label>
                  <input type="number" value={bayarJumlah}
                    onChange={(e) => setBayarJumlah(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
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
              <Button variant="primary" size="sm" ripple disabled={!bayarSiswa}
                onClick={() => {
                  if (!bayarSiswa) return;
                  const baru: SiswaRecord = {
                    id: `T-${Date.now()}`,
                    nama: bayarSiswa.nama,
                    noTransaksi: `TRX-${Date.now().toString().slice(-6)}`,
                    kelas: "-",
                    grup: bayarSiswa.grup as SiswaRecord["grup"],
                    yuranBulanan: 500,
                    yuranPendaftaran: 1000,
                    jenisYuran: "bulanan",
                    jumlahBayar: Number(bayarJumlah) || 500,
                    bulanDibayar: bayarBulan,
                    tanggal: "04 Okt 2026",
                    metodeBayar: "Tunai (Kaunter)",
                    status: "Lunas",
                    statusAktif: true,
                  };
                  setRecords((r) => [baru, ...r]);
                  setShowBayarModal(false);
                  window.setTimeout(() => setBayarSiswa(null), 460);
                }}
              >
                Simpan Bayaran
              </Button>
            </div>
        </CenterMorphModalContent>
      </CenterMorphModal>

      {/* Modal Import Siswa */}
      <CenterMorphModal open={showImportModal} onOpenChange={handleImportOpenChange}>
        <CenterMorphModalContent ariaLabel="Impor Data Siswa" className="max-w-lg p-6"
        >
            <h2 className="text-lg font-bold text-foreground">Impor Data Siswa</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Muat naik fail Excel mengikut template.{" "}
              <a
                href="/templates/template-yuran-datasiswa.xlsx"
                download="template-yuran-datasiswa.xlsx"
                className="font-semibold text-primary hover:underline"
              >
                Muat turun template
              </a>
            </p>
            <div className="mt-4">
              <FileUpload value={uploadItems}
                onValueChange={setUploadItems}
                onFilesAdded={handleImportFilesAdded}
                onRemove={handleImportRemove}
                onRetry={handleImportRetry}
                accept=".xlsx,.xls" multiple={false}
                maxFiles={1}
                variant="centered" title="Seret & letak fail Excel di sini" description="atau klik untuk pilih fail mengikut template" browseLabel="Pilih Fail"
              />
              {importPreview.length > 0 && (
                <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-border">
                  <table className="w-full text-xs text-foreground">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Nama</th>
                        <th className="px-3 py-2 text-left">Grup</th>
                        <th className="px-3 py-2 text-right">Yuran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
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
              <Button variant="primary" size="sm" ripple disabled={importPreview.length === 0}
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
