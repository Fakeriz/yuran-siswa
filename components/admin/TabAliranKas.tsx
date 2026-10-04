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
  kategori: "Yuran Asrama" | "Makanan & Dapur" | "Utiliti" | "Kebajikan Talebe" | "Penyelenggaraan";
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
    showToast(`Perbelanjaan RM ${amount.toLocaleString()} berjaya direkodkan.`);
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
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Butang Tambah */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Aliran Kas & Perbelanjaan
            </h1>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
              Buku Tunai
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Penyata aliran tunai masuk yuran asrama dan rekod perbelanjaan operasi bulanan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
          >
            <Download className="size-3.5 text-gray-500" />
            <span>Eksport Buku Tunai</span>
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors focus-visible:outline-emerald-600"
          >
            <Plus className="size-4" />
            <span>Catat Perbelanjaan</span>
          </button>
        </div>
      </div>

      {/* 3 Kad Ringkasan Kas Utama */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Jumlah Tunai Masuk
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-800">
              <ArrowDownLeft className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-800">RM {totalMasuk.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-500">Kutipan yuran bulanan 49 talebe</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Jumlah Perbelanjaan Keluar
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-800">
              <ArrowUpRight className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-700">RM {totalKeluar.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-500">Dapur, utiliti & penyelenggaraan</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Baki Kas Bersih
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-800">
              <Wallet className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">RM {bakiBersih.toLocaleString()}</p>
          <p className="mt-1 text-xs text-emerald-700 font-semibold">+87.0% lebihan tunai semasa</p>
        </div>
      </div>

      {/* Lejer Transaksi (Buku Tunai) */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        {/* Toolbar Carian & Penapis */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari transaksi, no. rujukan, kategori..."
              className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-2 pl-9 pr-4 text-xs text-gray-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 border border-gray-200/80">
            {(
              [
                ["semua", "Semua Aliran"],
                ["masuk", "Tunai Masuk"],
                ["keluar", "Tunai Keluar"],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setFilterJenis(val)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterJenis === val
                    ? "bg-white text-emerald-800 shadow-2xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Lejer */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th scope="col" className="px-5 py-3.5">Tarikh & No. Ruj</th>
                <th scope="col" className="px-5 py-3.5">Perihal / Keterangan</th>
                <th scope="col" className="px-5 py-3.5">Kategori</th>
                <th scope="col" className="px-5 py-3.5 text-right">Jumlah Masuk</th>
                <th scope="col" className="px-5 py-3.5 text-right">Jumlah Keluar</th>
                <th scope="col" className="px-5 py-3.5 text-right">Baki Kas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="font-semibold text-gray-900 text-xs">{tx.tarikh}</p>
                    <p className="font-mono text-[11px] text-gray-400">{tx.noRuj}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 text-xs">{tx.keterangan}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {tx.kategori}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap font-bold text-emerald-800">
                    {tx.jenis === "masuk" ? `+ RM ${tx.jumlah.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap font-bold text-rose-700">
                    {tx.jenis === "keluar" ? `- RM ${tx.jumlah.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap font-bold text-gray-900">
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Catat Perbelanjaan Asrama</h3>
                <p className="text-xs text-gray-500">Rekod aliran tunai keluar bagi operasi asrama.</p>
              </div>
            </div>

            <form onSubmit={handleAddExpense} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700">Perihal / Keterangan Perbelanjaan</label>
                <input
                  type="text"
                  required
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="cth: Belian lauk basah & beras asrama"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Kategori</label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as CashTransaction["kategori"])}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Makanan & Dapur">Makanan & Dapur</option>
                    <option value="Utiliti">Utiliti</option>
                    <option value="Kebajikan Talebe">Kebajikan Talebe</option>
                    <option value="Penyelenggaraan">Penyelenggaraan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Jumlah (RM)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={formJumlah}
                    onChange={(e) => setFormJumlah(e.target.value)}
                    placeholder="0.00"
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900"
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
