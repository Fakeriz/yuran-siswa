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
  grup: string; // Grup
  yuranBulanan: number; // Yuran_Bulanan (Default RM 500)
  jumlahBayar: number; // Jumlah_Bayar
  bulanDibayar: string; // Bulan_Dibayar
  tanggal: string; // Tanggal
  metodeBayar: "Online Transfer (FPX)" | "DuitNow QR" | "Tunai (Kaunter)" | "Bank Transfer" | "Belum Bayar";
  status: "Lunas" | "Tunggakan" | "Sebagian";
  statusAktif: boolean; // Status_Aktif
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

// Data asli dari spreadsheet "Aylik Talebe 2026" — 111 siswa, Oktober 2026
const initialSiswaData: SiswaRecord[] = [
  {
    id: "TB-001",
    noTransaksi: "TRX-202610-001",
    nama: "Mohd Amirul Afiq Bin Haris",
    grup: "Herian HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-002",
    noTransaksi: "TRX-202610-002",
    nama: "Muhammad Danish Danial bin Abdullah",
    grup: "Herian HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-003",
    noTransaksi: "TRX-202610-003",
    nama: "Muhammad Haziq Hashari Bin Mohd Norhan",
    grup: "Razi HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-004",
    noTransaksi: "TRX-202610-004",
    nama: "Muhammad Wafrie Danish Bin Abdul Sani",
    grup: "Razi HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-005",
    noTransaksi: "TRX-202610-005",
    nama: "Mohamad Dzulkarnain Riduan Bin Mohmad Jamil",
    grup: "Herian HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-006",
    noTransaksi: "TRX-202610-006",
    nama: "Wan Ahmad Baihaqi Bin Wan Noorul Hisham",
    grup: "Rizky HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-007",
    noTransaksi: "TRX-202610-007",
    nama: "Wan Taji Mustafa Bin Wan Noorul Hisham",
    grup: "Rizky HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-008",
    noTransaksi: "TRX-202610-008",
    nama: "Ahmad Ashraf Ihtisyam Bin Isidang",
    grup: "Mevlana HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-009",
    noTransaksi: "TRX-202610-009",
    nama: "Abdul Muhaimin Bin Yusuf",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-010",
    noTransaksi: "TRX-202610-010",
    nama: "Muhammad Rayyan Zakwan Bin Yusman",
    grup: "Rizky HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-011",
    noTransaksi: "TRX-202610-011",
    nama: "Muhammad Raihan Shafee Bin Samsu",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-012",
    noTransaksi: "TRX-202610-012",
    nama: "Muhammad Aqif Syahmi Bin Syamsul",
    grup: "Herian HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-013",
    noTransaksi: "TRX-202610-013",
    nama: "Muhammad Mikhailluqman Bin Zulkifli",
    grup: "Adhwa HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-014",
    noTransaksi: "TRX-202610-014",
    nama: "Ahmad Furqan Bin Ahmad Fahmi",
    grup: "Arif HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-015",
    noTransaksi: "TRX-202610-015",
    nama: "Amrullah Rizq Qhusyairi Bin Anzar",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-016",
    noTransaksi: "TRX-202610-016",
    nama: "Aqil Zafran Bin Firman",
    grup: "Arif HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-017",
    noTransaksi: "TRX-202610-017",
    nama: "Mikail Bin Andi Idro",
    grup: "Arif HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-018",
    noTransaksi: "TRX-202610-018",
    nama: "Mohammad Khairul Azman Bin Salihuddin",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-019",
    noTransaksi: "TRX-202610-019",
    nama: "Muhammad Arifsyah Bin Mohd Adnan",
    grup: "Mevlana HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-020",
    noTransaksi: "TRX-202610-020",
    nama: "Muhammad Fudayl Azfar Bin Azman",
    grup: "Rizky HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-021",
    noTransaksi: "TRX-202610-021",
    nama: "Muhammad Ilman Hazim Bin Mokhtar",
    grup: "Azwar HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-022",
    noTransaksi: "TRX-202610-022",
    nama: "Muhammad Iqbal Alqawiy Bin Asse",
    grup: "Herian HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-023",
    noTransaksi: "TRX-202610-023",
    nama: "Muhammad Naim Nasrullah Bin Abdullah",
    grup: "Rizky HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-024",
    noTransaksi: "TRX-202610-024",
    nama: "Muhammad Nur Hafiz Bin Burhanuddin",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-025",
    noTransaksi: "TRX-202610-025",
    nama: "Adam Hafiy Ziqri Bin Hasmat",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-026",
    noTransaksi: "TRX-202610-026",
    nama: "Aidyl Razi Bin Hardi",
    grup: "Arif HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-027",
    noTransaksi: "TRX-202610-027",
    nama: "Aqil Hamiz Bin Mustafa",
    grup: "Azwar HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-028",
    noTransaksi: "TRX-202610-028",
    nama: "Danial Darwisy Bin Mohd Suhaimi",
    grup: "Razi HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-029",
    noTransaksi: "TRX-202610-029",
    nama: "Erdieyan Syah Bin Yusof",
    grup: "Arif HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-030",
    noTransaksi: "TRX-202610-030",
    nama: "Faid Ziqri Bin Tukirin",
    grup: "Mevlana HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-031",
    noTransaksi: "TRX-202610-031",
    nama: "Ismail Bin Jalain",
    grup: "Arif HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-032",
    noTransaksi: "TRX-202610-032",
    nama: "Mirza Danish Ahmad Bin Mansor",
    grup: "Adhwa HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-033",
    noTransaksi: "TRX-202610-033",
    nama: "Mohammad Wafir Firdaus Bin Umar",
    grup: "Tamimi HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-034",
    noTransaksi: "TRX-202610-034",
    nama: "Mohd Gufron Bin Saharudin",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-035",
    noTransaksi: "TRX-202610-035",
    nama: "Muhammad Adam Haiqal Bin Mohd Zaidy",
    grup: "Tamimi HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-036",
    noTransaksi: "TRX-202610-036",
    nama: "Muhammad Aideel Rayyan Jamallan Bin Rahman",
    grup: "Rizky HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-037",
    noTransaksi: "TRX-202610-037",
    nama: "Muhammad Alif Firdaus Bin Aprisal",
    grup: "Razi HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "03 Okt 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-038",
    noTransaksi: "TRX-202610-038",
    nama: "Muhammad Bin Abdullah",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-039",
    noTransaksi: "TRX-202610-039",
    nama: "Muhammad Danish Iman Bin Iswan",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-040",
    noTransaksi: "TRX-202610-040",
    nama: "Muhammad Firas Bin Dile",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-041",
    noTransaksi: "TRX-202610-041",
    nama: "Muhammad Sakhrul Al Mujahid Bin Juffri",
    grup: "Rizky HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-042",
    noTransaksi: "TRX-202610-042",
    nama: "Muhammad Syahmi Bin Jupri",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-043",
    noTransaksi: "TRX-202610-043",
    nama: "Muhammad Firas Fahmi Bin Mattamase",
    grup: "Arif HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-044",
    noTransaksi: "TRX-202610-044",
    nama: "Nor Zakwan Bin Nor Azman",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-045",
    noTransaksi: "TRX-202610-045",
    nama: "Zawawi Bin Salim",
    grup: "Tamimi HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-046",
    noTransaksi: "TRX-202610-046",
    nama: "Aziman Bin Azis",
    grup: "Razi HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-047",
    noTransaksi: "TRX-202610-047",
    nama: "Azman Bin Azis",
    grup: "Mevlana HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-048",
    noTransaksi: "TRX-202610-048",
    nama: "Muhammad Izzat Fadhli Bin Ismail (Muhammad Izzat Fadhil Bin Ismail)",
    grup: "Razi HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-049",
    noTransaksi: "TRX-202610-049",
    nama: "Muhammad Izzul Fadhil Bin Ismail (Muhammad Izzul Fadhil Bin Ismail)",
    grup: "Razi HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-050",
    noTransaksi: "TRX-202610-050",
    nama: "Muhammad Saiful Adam Bin Saiful Sumardi",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-051",
    noTransaksi: "TRX-202610-051",
    nama: "Muhammad Saiful Alfayyadh Bin Saiful Sumardi",
    grup: "Azwar HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-052",
    noTransaksi: "TRX-202610-052",
    nama: "Afiq Zahran Bin Ali",
    grup: "Herian HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-053",
    noTransaksi: "TRX-202610-053",
    nama: "Ahmad Danial Syahri Bin Mohd Adnan",
    grup: "Arif HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "04 Okt 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-054",
    noTransaksi: "TRX-202610-054",
    nama: "Akhil Khairi Bin Atong",
    grup: "Arif HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-055",
    noTransaksi: "TRX-202610-055",
    nama: "Althaf Ahmad Bin Azrul",
    grup: "Azwar HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-056",
    noTransaksi: "TRX-202610-056",
    nama: "Ammar Asyraf Bin Hadmar",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-057",
    noTransaksi: "TRX-202610-057",
    nama: "Farien Bin Mohd Adam",
    grup: "Mevlana HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-058",
    noTransaksi: "TRX-202610-058",
    nama: "Irfan Suhaid Bin Sulaiman",
    grup: "Herian HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-059",
    noTransaksi: "TRX-202610-059",
    nama: "Mohammad Danish Izzat Bin Syafruddin",
    grup: "Adhwa HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "01 Okt 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-060",
    noTransaksi: "TRX-202610-060",
    nama: "Mohammad Farhan Zaqwan Bin Haris",
    grup: "Arif HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-061",
    noTransaksi: "TRX-202610-061",
    nama: "Mohammad Rian Hidayat Bin Mohd Dehlan",
    grup: "Adhwa HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "01 Okt 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-062",
    noTransaksi: "TRX-202610-062",
    nama: "Mohammad Syed Bin Mohd Asarie",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-063",
    noTransaksi: "TRX-202610-063",
    nama: "Mohammad Yusri Bin Mohd Ali",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-064",
    noTransaksi: "TRX-202610-064",
    nama: "Mohammad Zuhaily Izzuddin Bin Azman",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-065",
    noTransaksi: "TRX-202610-065",
    nama: "Mohd Adiq Qayyum Bin Mulyamin",
    grup: "Adhwa HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-066",
    noTransaksi: "TRX-202610-066",
    nama: "Muhammad Adam Izzuddin Bin Mazmin",
    grup: "Rizky HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-067",
    noTransaksi: "TRX-202610-067",
    nama: "Muhammad Aiman Hafeez Bin Hasnizan",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-068",
    noTransaksi: "TRX-202610-068",
    nama: "Muhammad Alfatih Bin Edhin Halik",
    grup: "Azwar HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-069",
    noTransaksi: "TRX-202610-069",
    nama: "Muhammad Aniq Ieqram Bin Jumadin",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-070",
    noTransaksi: "TRX-202610-070",
    nama: "Muhammad Aqil Nufail Bin Sulaiman",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-071",
    noTransaksi: "TRX-202610-071",
    nama: "Muhammad Asyraf Bin Sakka",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-072",
    noTransaksi: "TRX-202610-072",
    nama: "Muhammad Azeem Eskandar Bin Rudy",
    grup: "Adhwa HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-073",
    noTransaksi: "TRX-202610-073",
    nama: "Muhammad Danish Ashraf Bin Mohd Azri",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-074",
    noTransaksi: "TRX-202610-074",
    nama: "Muhammad Danish Bin S Achmadi",
    grup: "Adhwa HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-075",
    noTransaksi: "TRX-202610-075",
    nama: "Muhammad Fadhil Aiman Bin Mohd Fadlie",
    grup: "Azwar HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-076",
    noTransaksi: "TRX-202610-076",
    nama: "Muhammad Faiz Bin Mohamad Rosdi",
    grup: "Rizky HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-077",
    noTransaksi: "TRX-202610-077",
    nama: "Muhammad Ghazi Ziqri Bin Sabrie",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-078",
    noTransaksi: "TRX-202610-078",
    nama: "Muhammad Hafizul Bin Aziz",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-079",
    noTransaksi: "TRX-202610-079",
    nama: "Muhammad Miqhael Muadzamshah Bin Zuhermansha",
    grup: "Adhwa HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-080",
    noTransaksi: "TRX-202610-080",
    nama: "Muhammad Muazzam Haikal Bin Abd Malik",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-081",
    noTransaksi: "TRX-202610-081",
    nama: "Muhammad Nazmi Bin Jainal",
    grup: "Tamimi HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-082",
    noTransaksi: "TRX-202610-082",
    nama: "Muhammad Nuaim Bin Nasrol",
    grup: "Rizky HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-083",
    noTransaksi: "TRX-202610-083",
    nama: "Muhammad Saifullah Bin Sabaruddin",
    grup: "Arif HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-084",
    noTransaksi: "TRX-202610-084",
    nama: "Muhammad Syafie Bin Risal",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-085",
    noTransaksi: "TRX-202610-085",
    nama: "Muhammad Syah Niezam Bin Abdullah",
    grup: "Tamimi HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-086",
    noTransaksi: "TRX-202610-086",
    nama: "Muhammad Syaz Redzuan Bin Suardi",
    grup: "Mevlana HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "04 Okt 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-087",
    noTransaksi: "TRX-202610-087",
    nama: "Muhammad Zulfadhli Bin Roslan",
    grup: "Razi HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "03 Sep 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-088",
    noTransaksi: "TRX-202610-088",
    nama: "Muhammad Abdurrahman Bin Muhammat Ruslan",
    grup: "Azwar HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "01 Okt 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-089",
    noTransaksi: "TRX-202610-089",
    nama: "Samsul Hafeez Bin Samsualam",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-090",
    noTransaksi: "TRX-202610-090",
    nama: "Abi Izz Rayyan Bin Sabran Zabur",
    grup: "Azwar HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-091",
    noTransaksi: "TRX-202610-091",
    nama: "Addin Bin Agus",
    grup: "Razi HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-092",
    noTransaksi: "TRX-202610-092",
    nama: "Alif Bin Agus",
    grup: "Mevlana HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-093",
    noTransaksi: "TRX-202610-093",
    nama: "Ammar Khalish Naim Bin Ruslih",
    grup: "Azwar HE",
    yuranBulanan: 375,
    jumlahBayar: 375,
    bulanDibayar: "Oktober 2026",
    tanggal: "01 Okt 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-094",
    noTransaksi: "TRX-202610-094",
    nama: "Danial Khalish Bin Ruslih",
    grup: "Azwar HE",
    yuranBulanan: 375,
    jumlahBayar: 375,
    bulanDibayar: "Oktober 2026",
    tanggal: "01 Okt 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-095",
    noTransaksi: "TRX-202610-095",
    nama: "Muhammad Aniq Hafizie Bin Amil Hamzah (Muhammad Aniq Hafizie)",
    grup: "Azwar HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-096",
    noTransaksi: "TRX-202610-096",
    nama: "Muhammad Aniq Hamizie Bin Amil Hamzah",
    grup: "Azwar HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-097",
    noTransaksi: "TRX-202610-097",
    nama: "Muhammad Fadhillah Wajih",
    grup: "Rizky HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-098",
    noTransaksi: "TRX-202610-098",
    nama: "Ali Ammar Bin Abd Rahman",
    grup: "Razi HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "24 Jun 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-099",
    noTransaksi: "TRX-202610-099",
    nama: "Denish Mikhail Bin Rafai",
    grup: "Azwar HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-100",
    noTransaksi: "TRX-202610-100",
    nama: "Muaz Bin Jamal",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-101",
    noTransaksi: "TRX-202610-101",
    nama: "Muhammad Qusyairi Wasim Amar Bin Kahar",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "30 Sep 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-102",
    noTransaksi: "TRX-202610-102",
    nama: "Muhammad Thaqif Bin Alfian",
    grup: "Ameer HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-103",
    noTransaksi: "TRX-202610-103",
    nama: "Mohd Rasul Iman Mustaqim Bin Abdullah",
    grup: "Mevlana HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "03 Sep 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-104",
    noTransaksi: "TRX-202610-104",
    nama: "Ungku Aiman Harraz Bin Ungku Anis Fadilah",
    grup: "Adhwa HE",
    yuranBulanan: 500,
    jumlahBayar: 500,
    bulanDibayar: "Oktober 2026",
    tanggal: "25 Sep 2026",
    metodeBayar: "Bank Transfer",
    status: "Lunas",
    statusAktif: true
  },
  {
    id: "TB-105",
    noTransaksi: "TRX-202610-105",
    nama: "Ahmad Tarmizi Bin Samsu",
    grup: "Mevlana HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-106",
    noTransaksi: "TRX-202610-106",
    nama: "Mohamad Aqil Haziq Bin Azril",
    grup: "Tamimi HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-107",
    noTransaksi: "TRX-202610-107",
    nama: "Mohamad Aqil Razaq Bin Azril",
    grup: "Razi HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-108",
    noTransaksi: "TRX-202610-108",
    nama: "Muhammad Hadif Izzat Bin Mohd Hasbi",
    grup: "Tamimi HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-109",
    noTransaksi: "TRX-202610-109",
    nama: "Muhammad Nizam Bin Saripuddin",
    grup: "Mevlana HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-110",
    noTransaksi: "TRX-202610-110",
    nama: "Abdul Kahar Bin Dahli",
    grup: "Adnan HE ve Syukri HE",
    yuranBulanan: 375,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  },
  {
    id: "TB-111",
    noTransaksi: "TRX-202610-111",
    nama: "Muhaimin Darwishah Bin Mustamin",
    grup: "Azwar HE",
    yuranBulanan: 500,
    jumlahBayar: 0,
    bulanDibayar: "Oktober 2026",
    tanggal: "-",
    metodeBayar: "Belum Bayar",
    status: "Tunggakan",
    statusAktif: true
  }
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

  const [records, setRecords] = useState<SiswaRecord[]>(initialSiswaData);
  const qParam = searchParams.get("q") ?? "";
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
      const [nama, grup, , yuranStr, aktifStr] = cols;
      if (!nama) throw new Error(`Baris ${i + 1}: Nama wajib diisi.`);
      const yuran = Number(yuranStr);
      if (!yuranStr || isNaN(yuran) || yuran < 0) throw new Error(`Baris ${i + 1}: Yuran Bulanan tidak valid.`);
      rows.push({
        id: `T-IMP-${Date.now()}-${i}`,
        nama,
        noTransaksi: "-",
        grup: (grup || "Umum"),
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
          header: "ID & No. Transaksi",
          cell: ({ row }) => (
            <div className="whitespace-nowrap">
              <div className="font-mono text-xs font-semibold text-foreground">
                {row.original.noTransaksi}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">{row.original.id}</div>
            </div>
          ),
          sortFn: "alphanumeric",
        }),
        columnHelper.accessor("nama", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
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
        columnHelper.accessor("yuranBulanan", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Yuran Bulanan" align="right" />,
          cell: ({ row }) => (
            <div className="whitespace-nowrap text-right font-medium text-foreground">
              {formatRM(row.original.yuranBulanan)}
            </div>
          ),
          sortFn: "basic",
        }),
        columnHelper.accessor("jumlahBayar", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Jumlah Bayar" align="right" />,
          cell: ({ row }) => {
            const baki = row.original.yuranBulanan - row.original.jumlahBayar;
            return (
              <div className="whitespace-nowrap text-right">
                <div className="font-semibold text-foreground">
                  {formatRM(row.original.jumlahBayar)}
                </div>
                {baki > 0 && (
                  <div className="text-[11px] text-rose-600 font-medium">
                    Sisa: {formatRM(baki)}
                  </div>
                )}
              </div>
            );
          },
          sortFn: "basic",
        }),
        columnHelper.accessor("metodeBayar", {
          header: "Metode Pembayaran",
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {row.original.metodeBayar}
            </span>
          ),
          sortFn: "text",
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
        columnHelper.accessor("status", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Status" align="center" />,
          cell: ({ row }) => <div className="whitespace-nowrap text-center"><LencanaStatus status={row.original.status} /></div>,
          sortFn: "text",
        }),
        columnHelper.display({
          id: "tindakan",
          header: () => <span className="block text-center">Tindakan</span>,
          cell: ({ row }) => (
            <div className="text-center" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" onClick={() => openRecordModal(row.original)}
                title="Lihat Detail Kuitansi"
              >
                <Eye className="size-4" />
              </Button>
            </div>
          ),
        }),
      ]),
    [openRecordModal]
  );

  // Definisi lajur TanStack Table — varian senarai siswa
  const siswaColumns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("id", {
          header: "ID Siswa",
          cell: ({ row }) => (
            <div className="whitespace-nowrap font-mono text-xs font-semibold text-foreground">
              {row.original.id}
            </div>
          ),
          sortFn: "alphanumeric",
        }),
        columnHelper.accessor("nama", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Siswa" />,
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
        columnHelper.accessor("yuranBulanan", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Yuran Bulanan" align="right" />,
          cell: ({ row }) => (
            <div className="whitespace-nowrap text-right font-medium text-foreground">
              {formatRM(row.original.yuranBulanan)}
            </div>
          ),
          sortFn: "basic",
        }),
        columnHelper.accessor("status", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Status Bayaran" align="center" />,
          cell: ({ row }) => <div className="whitespace-nowrap text-center"><LencanaStatusSiswa status={row.original.status} /></div>,
          sortFn: "text",
        }),
        columnHelper.accessor((row) => (row.statusAktif ? 1 : 0), {
          id: "statusAktif",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Aktif" align="center" />,
          cell: ({ row }) => <div className="whitespace-nowrap text-center"><LencanaAktif aktif={row.original.statusAktif} /></div>,
          sortFn: "basic",
        }),
        columnHelper.display({
          id: "tindakan",
          header: () => <span className="block text-center">Tindakan</span>,
          cell: ({ row }) => (
            <div className="text-center" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" onClick={() => openRecordModal(row.original)} title="Lihat Detail">
                <Eye className="size-4" />
              </Button>
            </div>
          ),
        }),
      ]),
    [openRecordModal]
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
                <MorphSelect value={selectedMonth}
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
                +12.4%
              </span>
              <span className="text-xs text-muted-foreground">dibanding bulan lalu</span>
            </div>
          </FinanceKpi>
          <FinanceKpi icon={Target}
            tone="green" value={formatRM(totalTarget)}
            label="Target pemasukan bulanan"
          >
            <p className="text-xs text-muted-foreground">Target dasar: 60 Siswa × RM 500</p>
          </FinanceKpi>
          <FinanceKpi icon={AlertCircle}
            tone="pink" value={formatRM(totalTunggakan)}
            label="Total tunggakan"
          >
            <span className="inline-flex w-fit rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
              11 Siswa belum bayar
            </span>
          </FinanceKpi>
          <FinanceKpi icon={PieChart}
            tone="blue" value={`${persentaseKutipan.toFixed(1)}%`}
            label="Tingkat penagihan yuran"
          >
            <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={81.7}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Kemajuan penagihan"
            >
              <div className="h-full rounded-full bg-emerald-500" style={{ width: "81.7%" }} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">49/60 Lunas</p>
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
      {isAliranKas && (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5 w-full min-w-0">
        <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jumlah Masuk</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600">RM 24,500</p>
          <p className="mt-1 text-xs text-muted-foreground">Oktober 2026 · 49 transaksi</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jumlah Keluar</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-600">RM 3,200</p>
          <p className="mt-1 text-xs text-muted-foreground">Oktober 2026 · pengeluaran operasional</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saldo Bersih</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-foreground">RM 21,300</p>
          <p className="mt-1 text-xs text-muted-foreground">Selisih masuk dan keluar bulan ini</p>
        </div>
      </div>
      )}

      {/* Daftar Kuitansi (tab kuitansi sahaja) */}
      {isResit && (
      <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden w-full min-w-0">
        <div className="p-4 sm:p-5 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Kuitansi Terkini</h2>
          <p className="mt-1 text-xs text-muted-foreground">Dokumen bukti pembayaran yang dimuat naik.</p>
        </div>
        <ul className="divide-y divide-border">
          {[
            { no: "R-2026-1042", siswa: "Ahmad bin Ali", jumlah: "RM 500", tarikh: "02 Okt 2026" },
            { no: "R-2026-1041", siswa: "Siti binti Hassan", jumlah: "RM 500", tarikh: "02 Okt 2026" },
            { no: "R-2026-1040", siswa: "Mohd Rizal", jumlah: "RM 500", tarikh: "01 Okt 2026" },
          ].map((r) => (
            <li key={r.no} className="flex items-center justify-between p-4 sm:p-5">
              <div>
                <p className="text-sm font-semibold text-foreground">{r.no} · {r.siswa}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.tarikh}</p>
              </div>
              <span className="text-sm font-bold text-foreground">{r.jumlah}</span>
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
          <PanelKemajuanGrup grup={[
              { nama: "Adhwa HE", terkumpul: 1500, sasaran: 4375 },
              { nama: "Adnan HE ve Syukri HE", terkumpul: 0, sasaran: 8750 },
              { nama: "Ameer HE", terkumpul: 1000, sasaran: 6500 },
              { nama: "Arif HE", terkumpul: 1000, sasaran: 5500 },
              { nama: "Azwar HE", terkumpul: 1250, sasaran: 6250 },
              { nama: "Herian HE", terkumpul: 0, sasaran: 3500 },
              { nama: "Mevlana HE", terkumpul: 1000, sasaran: 4500 },
              { nama: "Razi HE", terkumpul: 1500, sasaran: 4875 },
              { nama: "Rizky HE", terkumpul: 0, sasaran: 5125 },
              { nama: "Tamimi HE", terkumpul: 0, sasaran: 3375 },
            ]}
          />
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
                    grup: bayarSiswa.grup as SiswaRecord["grup"],
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
              Muat naik fail CSV mengikut template.{" "}
              <button type="button" onClick={() => {
                  const tpl = "Nama,Grup,Kelas,Yuran Bulanan (RM),Aktif (Ya/Tidak),Sesi\n\"Mohd Amirul Afiq Bin Haris\",\"Umum\",\"Tingkatan 1\",500,Ya,2026/2027\n";
                  const blob = new Blob(["\uFEFF" + tpl], { type: "text/csv;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "template-import-siswa.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="font-semibold text-primary hover:underline"
              >
                Muat turun template
              </button>
            </p>
            <div className="mt-4">
              <FileUpload value={uploadItems}
                onValueChange={setUploadItems}
                onFilesAdded={handleImportFilesAdded}
                onRemove={handleImportRemove}
                onRetry={handleImportRetry}
                accept=".csv" multiple={false}
                maxFiles={1}
                variant="centered" title="Seret & letak fail CSV di sini" description="atau klik untuk pilih fail mengikut template" browseLabel="Pilih Fail"
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
