"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Building2,
  TrendingUp,
  AlertCircle,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

export function TabPenyata() {
  const [selectedBulan, setSelectedBulan] = useState("Oktober 2026");
  const [selectedSesi, setSelectedSesi] = useState("2026/2027");

  const summary = {
    sasaran: 30000,
    kutipan: 24500,
    tunggakan: 5500,
    peratusan: 81.7,
    bilLunas: 49,
    jumlahSiswa: 60,
  };

  const groupData = [
    {
      grup: "Mevlana HE",
      ustaz: "Ustaz Ahmad Farhan",
      siswa: 20,
      yuran: 500,
      sasaran: 10000,
      kutipan: 8500,
      peratus: 85,
      tunggakan: 1500,
      bilLunas: 17,
      bilTunggak: 3,
    },
    {
      grup: "Razi HE",
      ustaz: "Ustaz Mohd Haziq",
      siswa: 20,
      yuran: 500,
      sasaran: 10000,
      kutipan: 8000,
      peratus: 80,
      tunggakan: 2000,
      bilLunas: 16,
      bilTunggak: 4,
    },
    {
      grup: "Fatih HE",
      ustaz: "Ustaz Luqman Hakim",
      siswa: 20,
      yuran: 500,
      sasaran: 10000,
      kutipan: 8000,
      peratus: 80,
      tunggakan: 2000,
      bilLunas: 16,
      bilTunggak: 4,
    },
  ];

  const methodData = [
    { kaedah: "Tunai (Kaunter Pejabat)", transaksi: 22, jumlah: 11000, peratus: 44.9 },
    { kaedah: "Perbankan Internet (FPX)", transaksi: 20, jumlah: 10000, peratus: 40.8 },
    { kaedah: "Mesin Deposit Tunai (CDM)", transaksi: 7, jumlah: 3500, peratus: 14.3 },
  ];

  const arrearsData = [
    { nama: "Mohd Danial", grup: "Mevlana HE", kelas: "Tahun 2 Bestari", tunggakan: "RM 500.00", bulan: "1 Bulan", telefon: "+60 12-334 4556" },
    { nama: "Siti Sarah", grup: "Mevlana HE", kelas: "Tahun 1 Amanah", tunggakan: "RM 500.00", bulan: "1 Bulan", telefon: "+60 17-889 9001" },
    { nama: "Hafizuddin bin Omar", grup: "Mevlana HE", kelas: "Tahun 3 Cerdas", tunggakan: "RM 500.00", bulan: "1 Bulan", telefon: "+60 19-223 3445" },
    { nama: "Zaim bin Zaidi", grup: "Razi HE", kelas: "Tahun 2 Bestari", tunggakan: "RM 500.00", bulan: "1 Bulan", telefon: "+60 14-556 6778" },
    { nama: "Nurul Izzah", grup: "Razi HE", kelas: "Tahun 1 Amanah", tunggakan: "RM 500.00", bulan: "1 Bulan", telefon: "+60 11-445 5667" },
    { nama: "Adam Haris", grup: "Fatih HE", kelas: "Tahun 3 Cerdas", tunggakan: "RM 500.00", bulan: "1 Bulan", telefon: "+60 13-998 8776" },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ["Penyata Yuran Bulanan & Laporan Audit Asrama"],
      [`Bulan: ${selectedBulan}`, `Sesi Persekolahan: ${selectedSesi}`],
      [""],
      ["1. RINGKASAN EKSEKUTIF"],
      ["Sasaran Kutipan", `RM ${summary.sasaran}`],
      ["Jumlah Kutipan", `RM ${summary.kutipan}`],
      ["Baki Tunggakan", `RM ${summary.tunggakan}`],
      ["Kadar Kutipan", `${summary.peratusan}%`],
      ["Bilangan Lunas", `${summary.bilLunas} / ${summary.jumlahSiswa} Siswa`],
      [""],
      ["2. PECAHAN MENGIKUT KUMPULAN ASRAMA"],
      ["Kumpulan", "Staf Pembimbing", "Bil. Siswa", "Sasaran (RM)", "Kutipan (RM)", "Peratus (%)", "Tunggakan (RM)"],
      ...groupData.map((g) => [g.grup, g.ustaz, String(g.siswa), String(g.sasaran), String(g.kutipan), `${g.peratus}%`, String(g.tunggakan)]),
      [""],
      ["3. PECAHAN MENGIKUT KAEDAH BAYARAN"],
      ["Kaedah Pembayaran", "Bil. Transaksi", "Jumlah (RM)", "Peratus (%)"],
      ...methodData.map((m) => [m.kaedah, String(m.transaksi), String(m.jumlah), `${m.peratus}%`]),
    ];

    const csvContent = "\uFEFF" + rows.map((e) => e.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `penyata-yuran-${selectedBulan.replace(/\s+/g, "-").toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header & Butang Cetak/Export */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Penyata Bulanan & Laporan Audit
            </h1>
            <span className="inline-flex items-center rounded-md bg-[var(--success-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--success)] border border-[var(--success-border)]">
              Laporan Rasmi
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Penyata kutipan kewangan yuran bulanan asrama Siswa untuk semakan adminan dan audit.
          </p>
        </div>

        {/* Kawalan Pemilih Bulan & Butang Eksport */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="appearance-none rounded-xl border border-input bg-card py-2 pl-3 pr-8 text-xs font-semibold text-foreground shadow-2xs hover:border-gray-400 focus:border-primary focus:outline-hidden"
            >
              <option value="Oktober 2026">Oktober 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="Ogos 2026">Ogos 2026</option>
            </select>
            <Calendar className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-full border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors"
          >
            <Printer className="size-3.5 text-muted-foreground" />
            <span>Cetak Penyata</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors focus-visible:outline-primary"
          >
            <Download className="size-3.5" />
            <span>Muat Turun CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Ringkasan Eksekutif Kewangan */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sasaran Kutipan Yuran
            </span>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Building2 className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">RM {summary.sasaran.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted-foreground">{summary.jumlahSiswa} Siswa x RM 500</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jumlah Kutipan Sebenar
            </span>
            <div className="rounded-xl bg-[var(--success-bg)] p-2 text-[var(--success)]">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[var(--success)]">RM {summary.kutipan.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[var(--success)] font-semibold">{summary.peratusan}% berhasil dikutip</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Baki Tunggakan
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-800">
              <AlertCircle className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-700">RM {summary.tunggakan.toLocaleString()}</p>
          <p className="mt-1 text-xs text-rose-600 font-medium">11 Siswa belum selesai</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pencapaian Status Lunas
            </span>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">{summary.bilLunas} / {summary.jumlahSiswa}</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${summary.peratusan}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Jadual Prestasi Kumpulan Asrama (Dorm Groups) */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Prestasi Kutipan Mengikut Kumpulan HE</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Perbandingan kutipan yuran antara ketiga-tiga asrama bagi bulan {selectedBulan}.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/80 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
              <tr>
                <th scope="col" className="px-5 py-3.5">Kumpulan Asrama</th>
                <th scope="col" className="px-5 py-3.5">Staf Pembimbing</th>
                <th scope="col" className="px-5 py-3.5 text-center">Bil. Siswa</th>
                <th scope="col" className="px-5 py-3.5 text-right">Sasaran</th>
                <th scope="col" className="px-5 py-3.5 text-right">Kutipan</th>
                <th scope="col" className="px-5 py-3.5 text-center">Pencapaian</th>
                <th scope="col" className="px-5 py-3.5 text-right">Baki Tunggakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {groupData.map((g) => (
                <tr key={g.grup} className="hover:bg-muted/50">
                  <td className="px-5 py-4 font-bold text-foreground">{g.grup}</td>
                  <td className="px-5 py-4 text-muted-foreground">{g.ustaz}</td>
                  <td className="px-5 py-4 text-center font-medium">{g.siswa} Siswa</td>
                  <td className="px-5 py-4 text-right font-medium text-foreground">RM {g.sasaran.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-bold text-[var(--success)]">RM {g.kutipan.toLocaleString()}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center rounded-md bg-[var(--success-bg)] px-2 py-0.5 text-xs font-bold text-[var(--success)] border border-[var(--success-border)]">
                      {g.peratus}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-rose-700">RM {g.tunggakan.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted font-bold text-foreground border-t border-border text-sm">
              <tr>
                <td className="px-5 py-3.5" colSpan={2}>JUMLAH KESELURUHAN</td>
                <td className="px-5 py-3.5 text-center">{summary.jumlahSiswa} Siswa</td>
                <td className="px-5 py-3.5 text-right">RM {summary.sasaran.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-right text-[var(--success)]">RM {summary.kutipan.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-center text-[var(--success)]">{summary.peratusan}%</td>
                <td className="px-5 py-3.5 text-right text-rose-700">RM {summary.tunggakan.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 3. Pecahan Kaedah Pembayaran */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card shadow-xs p-5">
          <h2 className="text-base font-bold text-foreground">Pecahan Mengikut Kaedah Bayaran</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Statistik saluran kutipan wang masuk asrama.</p>
          <div className="mt-5 space-y-4">
            {methodData.map((m) => (
              <div key={m.kaedah} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-3.5 text-[var(--success)]" />
                    <span className="font-semibold text-foreground">{m.kaedah}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">RM {m.jumlah.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-1.5">({m.transaksi} bayaran)</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                    style={{ width: `${m.peratus}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Tindakan Susulan Tunggakan Yuran */}
        <div className="rounded-2xl border border-border bg-card shadow-xs p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Senarai Tindakan Susulan Tunggakan</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Siswa yang masih belum melunaskan yuran {selectedBulan}.</p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              6 Perlu Susulan
            </span>
          </div>
          <div className="mt-4 divide-y divide-border max-h-60 overflow-y-auto">
            {arrearsData.map((item) => (
              <div key={item.nama} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground">{item.nama}</p>
                  <p className="text-[11px] text-muted-foreground">{item.grup} · {item.telefon}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-700">{item.tunggakan}</span>
                  <p className="text-[11px] text-muted-foreground">{item.bulan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
