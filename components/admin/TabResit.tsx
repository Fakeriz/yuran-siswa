"use client";

import { useState } from "react";
import {
  Receipt,
  Upload,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Printer,
  Calendar,
} from "lucide-react";

export interface ReceiptItem {
  id: string;
  noKuitansi: string;
  namaSiswa: string;
  grup: string;
  bulan: string;
  jumlah: number;
  tarikhBayar: string;
  kaedah: string;
  kwitansiUploaded: boolean;
  kwitansiFileName?: string;
  driveFileId?: string;
}

const INITIAL_RECEIPTS: ReceiptItem[] = [
  {
    id: "rec-1",
    noKuitansi: "R-2026-1042",
    namaSiswa: "Ahmad bin Ali",
    grup: "Mevlana HE",
    bulan: "Oktober 2026",
    jumlah: 500,
    tarikhBayar: "02 Okt 2026",
    kaedah: "Tunai (Kaunter)",
    kwitansiUploaded: true,
    kwitansiFileName: "kwitansi_ahmad_ali_okt2026.pdf",
    driveFileId: "1DriveFileAhmad1042",
  },
  {
    id: "rec-2",
    noKuitansi: "R-2026-1041",
    namaSiswa: "Siti Nurhaliza",
    grup: "Mevlana HE",
    bulan: "Oktober 2026",
    jumlah: 500,
    tarikhBayar: "02 Okt 2026",
    kaedah: "Perbankan Internet (FPX)",
    kwitansiUploaded: true,
    kwitansiFileName: "kwitansi_siti_nurhaliza_okt2026.pdf",
    driveFileId: "1DriveFileSiti1041",
  },
  {
    id: "rec-3",
    noKuitansi: "R-2026-1040",
    namaSiswa: "Mohd Rizal",
    grup: "Razi HE",
    bulan: "Oktober 2026",
    jumlah: 500,
    tarikhBayar: "01 Okt 2026",
    kaedah: "Mesin Deposit Tunai (CDM)",
    kwitansiUploaded: false,
  },
  {
    id: "rec-4",
    noKuitansi: "R-2026-1039",
    namaSiswa: "Muhammad Faiz",
    grup: "Razi HE",
    bulan: "Oktober 2026",
    jumlah: 500,
    tarikhBayar: "01 Okt 2026",
    kaedah: "Perbankan Internet (FPX)",
    kwitansiUploaded: false,
  },
  {
    id: "rec-5",
    noKuitansi: "R-2026-1038",
    namaSiswa: "Nur Aisyah",
    grup: "Fatih HE",
    bulan: "Oktober 2026",
    jumlah: 500,
    tarikhBayar: "30 Sep 2026",
    kaedah: "Tunai (Kaunter)",
    kwitansiUploaded: true,
    kwitansiFileName: "kwitansi_nur_aisyah_sep2026.pdf",
    driveFileId: "1DriveFileAisyah1038",
  },
  {
    id: "rec-6",
    noKuitansi: "R-2026-1037",
    namaSiswa: "Danial Hakimi",
    grup: "Fatih HE",
    bulan: "Oktober 2026",
    jumlah: 500,
    tarikhBayar: "30 Sep 2026",
    kaedah: "Perbankan Internet (FPX)",
    kwitansiUploaded: false,
  },
];

export function TabResit() {
  const [receipts, setReceipts] = useState<ReceiptItem[]>(INITIAL_RECEIPTS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"semua" | "uploaded" | "pending">("semua");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const pendingKwitansiCount = receipts.filter((r) => !r.kwitansiUploaded).length;

  const filtered = receipts.filter((r) => {
    const matchFilter =
      filterType === "semua" ||
      (filterType === "uploaded" && r.kwitansiUploaded) ||
      (filterType === "pending" && !r.kwitansiUploaded);
    const matchSearch =
      r.noKuitansi.toLowerCase().includes(search.toLowerCase()) ||
      r.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
      r.grup.toLowerCase().includes(search.toLowerCase()) ||
      r.kaedah.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceipt || !uploadFile) return;

    setReceipts((prev) =>
      prev.map((r) =>
        r.id === selectedReceipt.id
          ? {
              ...r,
              kwitansiUploaded: true,
              kwitansiFileName: uploadFile.name,
              driveFileId: `drive-${Date.now()}`,
            }
          : r
      )
    );

    showToast(`Kwitansi rasmi bagi resit ${selectedReceipt.noKuitansi} (${selectedReceipt.namaSiswa}) berhasil dimuat naik ke Google Drive.`);
    setShowUploadModal(false);
    setSelectedReceipt(null);
    setUploadFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Butang Muat Naik */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Resit & Kwitansi Rasmi
            </h1>
            {pendingKwitansiCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-[var(--warning-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--warning)] border border-[var(--warning-border)]">
                {pendingKwitansiCount} Menunggu Kwitansi
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Pengurusan dokumen rasmi bayaran yuran dan muat naik kwitansi rasmi admin ke Google Drive.
          </p>
        </div>

        <button type="button" onClick={() => {
            const firstPending = receipts.find((r) => !r.kwitansiUploaded);
            setSelectedReceipt(firstPending || receipts[0]);
            setShowUploadModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors focus-visible:outline-primary"
        >
          <Upload className="size-4" />
          <span>Muat Naik Kwitansi Rasmi</span>
        </button>
      </div>

      {/* Ringkasan Status Kwitansi */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Kwitansi Rasmi Dikeluarkan
            </span>
            <div className="rounded-xl bg-[var(--success-bg)] p-2 text-[var(--success)]">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[var(--success)]">
            {receipts.filter((r) => r.kwitansiUploaded).length} Resit
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Tersedia di Google Drive & portal orang tua</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Menunggu Muat Naik Kwitansi
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-[var(--warning)]">
              <AlertCircle className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[var(--warning)]">{pendingKwitansiCount} Resit</p>
          <p className="mt-1 text-xs text-muted-foreground">Perlu dimuat naik oleh admin</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jumlah Resit Pembayaran
            </span>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Receipt className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">{receipts.length} Rekod</p>
          <p className="mt-1 text-xs text-muted-foreground">Bagi sesi kutipan semasa</p>
        </div>
      </div>

      {/* Toolbar Carian & Penapis */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-card">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. resit, siswa, grup..." className="w-full rounded-xl border border-input bg-muted/50 py-2 pl-9 pr-4 text-xs text-foreground focus:border-primary focus:bg-card focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-muted p-1 border border-border/80">
            {(
              [
                ["semua", "Semua"],
                ["uploaded", "Ada Kwitansi"],
                ["pending", `Menunggu (${pendingKwitansiCount})`],
              ] as const
            ).map(([val, label]) => (
              <button key={val}
                type="button" onClick={() => setFilterType(val)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterType === val
                    ? "bg-card text-[var(--success)] shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Jadual Resit */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/80 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
              <tr>
                <th scope="col" className="px-5 py-3.5">No. Resit</th>
                <th scope="col" className="px-5 py-3.5">Nama Siswa & Grup</th>
                <th scope="col" className="px-5 py-3.5">Bulan Yuran</th>
                <th scope="col" className="px-5 py-3.5">Kaedah Bayaran</th>
                <th scope="col" className="px-5 py-3.5 text-right">Jumlah</th>
                <th scope="col" className="px-5 py-3.5 text-center">Status Kwitansi</th>
                <th scope="col" className="px-5 py-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-foreground">
                    {item.noKuitansi}
                    <span className="block text-[11px] font-normal text-muted-foreground font-sans">{item.tarikhBayar}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-foreground">{item.namaSiswa}</p>
                    <p className="text-xs text-[var(--success)] font-medium">{item.grup}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-foreground">
                    {item.bulan}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-muted-foreground">
                    {item.kaedah}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right font-bold text-foreground">
                    RM {item.jumlah.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    {item.kwitansiUploaded ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 border border-green-200">
                        <CheckCircle2 className="size-3" />
                        <span>Kwitansi Dikeluarkan</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--warning-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--warning)] border border-[var(--warning-border)]">
                        <AlertCircle className="size-3" />
                        <span>Belum Dimuat Naik</span>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    {item.kwitansiUploaded ? (
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => alert(`Membuka fail kwitansi rasmi: ${item.kwitansiFileName} daripada Google Drive.`)}
                          className="inline-flex items-center gap-1 rounded-lg border border-input bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          <FileText className="size-3 text-[var(--success)]" />
                          <span>Lihat</span>
                        </button>
                        <button type="button" onClick={() => window.print()}
                          className="p-1 text-muted-foreground hover:text-foreground rounded-md" title="Cetak Resit"
                        >
                          <Printer className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => {
                          setSelectedReceipt(item);
                          setShowUploadModal(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                      >
                        <Upload className="size-3" />
                        <span>Upload Kwitansi</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload Kwitansi Rasmi */}
      {showUploadModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={() => setShowUploadModal(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl border border-border" onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg text-foreground">Muat Naik Kwitansi Rasmi</h3>
                <p className="text-xs text-muted-foreground">
                  Resit #{selectedReceipt.noKuitansi} · {selectedReceipt.namaSiswa}
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div className="rounded-xl bg-muted p-3.5 border border-border text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama Siswa:</span>
                  <span className="font-bold text-foreground">{selectedReceipt.namaSiswa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bulan & Jumlah:</span>
                  <span className="font-bold text-[var(--success)]">
                    {selectedReceipt.bulan} (RM {selectedReceipt.jumlah.toFixed(2)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kaedah Bayaran:</span>
                  <span className="text-foreground">{selectedReceipt.kaedah}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Pilih Fail Kwitansi Rasmi (PDF atau Gambar)
                </label>
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-input p-6 text-center cursor-pointer hover:border-emerald-600 transition-colors bg-muted/50">
                  <Upload className="size-6 text-muted-foreground mb-1.5" />
                  <span className="text-xs font-semibold text-foreground">
                    {uploadFile ? uploadFile.name : "Klik untuk muat naik dokumen kwitansi"}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    Format: PDF, JPG, PNG (Maks 10 MB). Disimpan ke Google Drive.
                  </span>
                  <input type="file" accept="image/*,application/pdf" required onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button type="button" onClick={() => setShowUploadModal(false)}
                  className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button type="submit" disabled={!uploadFile}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Simpan ke Google Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
