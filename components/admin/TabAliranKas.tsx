"use client";

import { useState } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export interface CashTransaction {
  id: string;
  tarikh: string;
  noRuj: string;
  keterangan: string;
  kategori: "Yuran Asrama" | "Makanan & Dapur" | "Utiliti" | "Kebajikan Siswa" | "Penyelenggaraan";
  jenis: "masuk" | "keluar";
  jumlah: number;
  baki: number;
}

const INITIAL_TRANSACTIONS: CashTransaction[] = [
  {
    id: "tx-1",
    tarikh: "04 Okt 2026",
    noRuj: "IN-2026-1049",
    keterangan: "Kutipan yuran bulanan Ahmad bin Ali (Oktober 2026)",
    kategori: "Yuran Asrama",
    jenis: "masuk",
    jumlah: 500,
    baki: 21300,
  },
  {
    id: "tx-2",
    tarikh: "03 Okt 2026",
    noRuj: "OUT-2026-088",
    keterangan: "Pembelian barangan basah & dapur asrama (Minggu 1)",
    kategori: "Makanan & Dapur",
    jenis: "keluar",
    jumlah: 1450,
    baki: 20800,
  },
  {
    id: "tx-3",
    tarikh: "02 Okt 2026",
    noRuj: "IN-2026-1048",
    keterangan: "Kutipan yuran bulanan Siti Nurhaliza (Oktober 2026)",
    kategori: "Yuran Asrama",
    jenis: "masuk",
    jumlah: 500,
    baki: 22250,
  },
  {
    id: "tx-4",
    tarikh: "02 Okt 2026",
    noRuj: "OUT-2026-087",
    keterangan: "Bil utiliti elektrik & air asrama (TNB & SAJ)",
    kategori: "Utiliti",
    jenis: "keluar",
    jumlah: 1200,
    baki: 21750,
  },
  {
    id: "tx-5",
    tarikh: "01 Okt 2026",
    noRuj: "OUT-2026-086",
    keterangan: "Penyelenggaraan paip & pam air asrama",
    kategori: "Penyelenggaraan",
    jenis: "keluar",
    jumlah: 550,
    baki: 22950,
  },
  {
    id: "tx-6",
    tarikh: "01 Okt 2026",
    noRuj: "IN-2026-1047",
    keterangan: "Kutipan yuran bulanan Muhammad Faiz (Oktober 2026)",
    kategori: "Yuran Asrama",
    jenis: "masuk",
    jumlah: 500,
    baki: 23500,
  },
];

export function TabAliranKas() {
  const [transactions, setTransactions] = useState<CashTransaction[]>(INITIAL_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState<"semua" | "masuk" | "keluar">("semua");
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form input
  const [formKeterangan, setFormKeterangan] = useState("");
  const [formKategori, setFormKategori] = useState<CashTransaction["kategori"]>("Makanan & Dapur");
  const [formJumlah, setFormJumlah] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const totalMasuk = 24500;
  const totalKeluar = 3200;
  const bakiBersih = totalMasuk - totalKeluar;

  const filtered = transactions.filter((t) => {
    const matchJenis = filterJenis === "semua" || t.jenis === filterJenis;
    const matchSearch =
      t.keterangan.toLowerCase().includes(search.toLowerCase()) ||
      t.noRuj.toLowerCase().includes(search.toLowerCase()) ||
      t.kategori.toLowerCase().includes(search.toLowerCase());
    return matchJenis && matchSearch;
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(formJumlah);
    if (!formKeterangan.trim() || !amount || amount <= 0) return;

    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      tarikh: "04 Okt 2026",
      noRuj: `OUT-2026-${Math.floor(100 + Math.random() * 900)}`,
      keterangan: formKeterangan,
      kategori: formKategori,
      jenis: "keluar",
      jumlah: amount,
      baki: bakiBersih - amount,
    };

    setTransactions([newTx, ...transactions]);
    showToast(`Perbelanjaan RM ${amount.toLocaleString()} berhasil dicatat.`);
    setShowModal(false);
    setFormKeterangan("");
    setFormJumlah("");
  };

  const handleExportCSV = () => {
    const rows = [
      ["Buku Tunai & Aliran Kas YuranKu"],
      ["Tarikh", "No. Rujukan", "Keterangan", "Kategori", "Jenis", "Jumlah (RM)", "Baki Kas (RM)"],
      ...filtered.map((t) => [
        t.tarikh,
        t.noRuj,
        t.keterangan,
        t.kategori,
        t.jenis === "masuk" ? "Tunai Masuk" : "Tunai Keluar",
        String(t.jumlah),
        String(t.baki),
      ]),
    ];

    const csvContent = "\uFEFF" + rows.map((e) => e.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aliran-kas-oktober-2026.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Butang Tambah */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Aliran Kas & Perbelanjaan
            </h1>
            <span className="inline-flex items-center rounded-md bg-[var(--success-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--success)] border border-[var(--success-border)]">
              Buku Tunai
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Penyata aliran tunai masuk yuran asrama dan catatan perbelanjaan operasi bulanan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-full border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span>Eksport Buku Tunai</span>
          </button>

          <button type="button" onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors focus-visible:outline-primary"
          >
            <Plus className="size-4" />
            <span>Catat Perbelanjaan</span>
          </button>
        </div>
      </div>

      {/* 3 Kad Ringkasan Kas Utama */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jumlah Tunai Masuk
            </span>
            <div className="rounded-xl bg-[var(--success-bg)] p-2 text-[var(--success)]">
              <ArrowDownLeft className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[var(--success)]">RM {totalMasuk.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted-foreground">Kutipan yuran bulanan 49 siswa</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jumlah Perbelanjaan Keluar
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-800">
              <ArrowUpRight className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-700">RM {totalKeluar.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted-foreground">Dapur, utiliti & penyelenggaraan</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Baki Kas Bersih
            </span>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Wallet className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">RM {bakiBersih.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[var(--success)] font-semibold">+87.0% lebihan tunai semasa</p>
        </div>
      </div>

      {/* Lejer Transaksi (Buku Tunai) */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Toolbar Carian & Penapis */}
        <div className="p-4 border-b border-border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-card">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari transaksi, no. rujukan, kategori..." className="w-full rounded-xl border border-input bg-muted/50 py-2 pl-9 pr-4 text-xs text-foreground focus:border-primary focus:bg-card focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-muted p-1 border border-border/80">
            {(
              [
                ["semua", "Semua Aliran"],
                ["masuk", "Tunai Masuk"],
                ["keluar", "Tunai Keluar"],
              ] as const
            ).map(([val, label]) => (
              <button key={val}
                type="button" onClick={() => setFilterJenis(val)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterJenis === val
                    ? "bg-card text-[var(--success)] shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Lejer */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/80 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
              <tr>
                <th scope="col" className="px-5 py-3.5">Tarikh & No. Ruj</th>
                <th scope="col" className="px-5 py-3.5">Perihal / Keterangan</th>
                <th scope="col" className="px-5 py-3.5">Kategori</th>
                <th scope="col" className="px-5 py-3.5 text-right">Jumlah Masuk</th>
                <th scope="col" className="px-5 py-3.5 text-right">Jumlah Keluar</th>
                <th scope="col" className="px-5 py-3.5 text-right">Baki Kas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/50">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="font-semibold text-foreground text-xs">{tx.tarikh}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{tx.noRuj}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-foreground text-xs">{tx.keterangan}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {tx.kategori}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap font-bold text-[var(--success)]">
                    {tx.jenis === "masuk" ? `+ RM ${tx.jumlah.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap font-bold text-rose-700">
                    {tx.jenis === "keluar" ? `- RM ${tx.jumlah.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap font-bold text-foreground">
                    RM {tx.baki.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Perbelanjaan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={() => setShowModal(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl border border-border" onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg text-foreground">Catat Perbelanjaan Asrama</h3>
                <p className="text-xs text-muted-foreground">Catatan aliran tunai keluar bagi operasi asrama.</p>
              </div>
            </div>

            <form onSubmit={handleAddExpense} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Perihal / Keterangan Perbelanjaan</label>
                <input type="text" required value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="cth: Belian lauk basah & beras asrama" className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Kategori</label>
                  <select value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as CashTransaction["kategori"])}
                    className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="Makanan & Dapur">Makanan & Dapur</option>
                    <option value="Utiliti">Utiliti</option>
                    <option value="Kebajikan Siswa">Kebajikan Siswa</option>
                    <option value="Penyelenggaraan">Penyelenggaraan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Jumlah (RM)</label>
                  <input type="number" required min="1" step="0.01" value={formJumlah}
                    onChange={(e) => setFormJumlah(e.target.value)}
                    placeholder="0.00" className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button type="submit" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Simpan Perbelanjaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
