"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  UserCheck,
  Plus,
  CheckCircle2,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";

export interface StaffAssignment {
  id: string;
  nama: string;
  email: string;
  telefon: string;
  grup: string;
  jawatan: string;
  bilanganSiswa: number;
  kadarKutipan: number; // percentage
  jumlahKutipan: number;
  sasaranKutipan: number;
  status: "Aktif" | "Cuti";
}

const INITIAL_STAFF: StaffAssignment[] = [
  {
    id: "staff-1",
    nama: "Staf Adhwa HE",
    email: "staf-1@yuran.demo",
    telefon: "-",
    grup: "Adhwa HE",
    jawatan: "Pembimbing Adhwa HE",
    bilanganSiswa: 9,
    kadarKutipan: 34,
    jumlahKutipan: 1500,
    sasaranKutipan: 4375,
    status: "Aktif"
  },
  {
    id: "staff-2",
    nama: "Staf Adnan HE ve Syukri HE",
    email: "staf-2@yuran.demo",
    telefon: "-",
    grup: "Adnan HE ve Syukri HE",
    jawatan: "Pembimbing Adnan HE ve Syukri HE",
    bilanganSiswa: 18,
    kadarKutipan: 0,
    jumlahKutipan: 0,
    sasaranKutipan: 8750,
    status: "Aktif"
  },
  {
    id: "staff-3",
    nama: "Staf Ameer HE",
    email: "staf-3@yuran.demo",
    telefon: "-",
    grup: "Ameer HE",
    jawatan: "Pembimbing Ameer HE",
    bilanganSiswa: 13,
    kadarKutipan: 15,
    jumlahKutipan: 1000,
    sasaranKutipan: 6500,
    status: "Aktif"
  },
  {
    id: "staff-4",
    nama: "Staf Arif HE",
    email: "staf-4@yuran.demo",
    telefon: "-",
    grup: "Arif HE",
    jawatan: "Pembimbing Arif HE",
    bilanganSiswa: 11,
    kadarKutipan: 18,
    jumlahKutipan: 1000,
    sasaranKutipan: 5500,
    status: "Aktif"
  },
  {
    id: "staff-5",
    nama: "Staf Azwar HE",
    email: "staf-5@yuran.demo",
    telefon: "-",
    grup: "Azwar HE",
    jawatan: "Pembimbing Azwar HE",
    bilanganSiswa: 14,
    kadarKutipan: 20,
    jumlahKutipan: 1250,
    sasaranKutipan: 6250,
    status: "Aktif"
  },
  {
    id: "staff-6",
    nama: "Staf Herian HE",
    email: "staf-6@yuran.demo",
    telefon: "-",
    grup: "Herian HE",
    jawatan: "Pembimbing Herian HE",
    bilanganSiswa: 7,
    kadarKutipan: 0,
    jumlahKutipan: 0,
    sasaranKutipan: 3500,
    status: "Aktif"
  },
  {
    id: "staff-7",
    nama: "Staf Mevlana HE",
    email: "staf-7@yuran.demo",
    telefon: "-",
    grup: "Mevlana HE",
    jawatan: "Pembimbing Mevlana HE",
    bilanganSiswa: 10,
    kadarKutipan: 22,
    jumlahKutipan: 1000,
    sasaranKutipan: 4500,
    status: "Aktif"
  },
  {
    id: "staff-8",
    nama: "Staf Razi HE",
    email: "staf-8@yuran.demo",
    telefon: "-",
    grup: "Razi HE",
    jawatan: "Pembimbing Razi HE",
    bilanganSiswa: 11,
    kadarKutipan: 31,
    jumlahKutipan: 1500,
    sasaranKutipan: 4875,
    status: "Aktif"
  },
  {
    id: "staff-9",
    nama: "Staf Rizky HE",
    email: "staf-9@yuran.demo",
    telefon: "-",
    grup: "Rizky HE",
    jawatan: "Pembimbing Rizky HE",
    bilanganSiswa: 11,
    kadarKutipan: 0,
    jumlahKutipan: 0,
    sasaranKutipan: 5125,
    status: "Aktif"
  },
  {
    id: "staff-10",
    nama: "Staf Tamimi HE",
    email: "staf-10@yuran.demo",
    telefon: "-",
    grup: "Tamimi HE",
    jawatan: "Pembimbing Tamimi HE",
    bilanganSiswa: 7,
    kadarKutipan: 0,
    jumlahKutipan: 0,
    sasaranKutipan: 3375,
    status: "Aktif"
  }
];

export function TabPenugasan() {
  const [staffList, setStaffList] = useState<StaffAssignment[]>(INITIAL_STAFF);
  const [search, setSearch] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffAssignment | null>(null);

  // Form states
  const [formNama, setFormNama] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefon, setFormTelefon] = useState("");
  const [formGrup, setFormGrup] = useState<StaffAssignment["grup"]>("Adhwa HE");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.grup.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formEmail.trim()) return;

    if (selectedStaff) {
      // Kemaskini penugasan
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === selectedStaff.id
            ? { ...s, nama: formNama, email: formEmail, telefon: formTelefon, grup: formGrup }
            : s
        )
      );
      showToast(`Penugasan ${formNama} untuk ${formGrup} berhasil diperbarui.`);
    } else {
      // Tambah staf baru
      const newStaff: StaffAssignment = {
        id: `staff-${Date.now()}`,
        nama: formNama,
        email: formEmail,
        telefon: formTelefon || "+60 1X-XXX XXXX",
        grup: formGrup,
        jawatan: `Staf Pembimbing Asrama ${formGrup.split(" ")[0]}`,
        bilanganSiswa: 20,
        kadarKutipan: 0,
        jumlahKutipan: 0,
        sasaranKutipan: 10000,
        status: "Aktif",
      };
      setStaffList((prev) => [newStaff, ...prev]);
      showToast(`Staf baru ${formNama} berhasil ditugaskan ke ${formGrup}.`);
    }

    setShowAssignModal(false);
    setSelectedStaff(null);
    setFormNama("");
    setFormEmail("");
    setFormTelefon("");
  };

  const openEditModal = (staff: StaffAssignment) => {
    setSelectedStaff(staff);
    setFormNama(staff.nama);
    setFormEmail(staff.email);
    setFormTelefon(staff.telefon);
    setFormGrup(staff.grup);
    setShowAssignModal(true);
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

      {/* Header & Butang Tambah Penugasan */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Penugasan Staf Asrama
            </h1>
            <span className="inline-flex items-center rounded-md bg-[var(--success-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--success)] border border-[var(--success-border)]">
              3 Kumpulan HE
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Urus penugasan Ustaz dan Staf pembimbing bagi setiap kumpulan asrama Siswa.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedStaff(null);
            setFormNama("");
            setFormEmail("");
            setFormTelefon("");
            setFormGrup("Mevlana HE");
            setShowAssignModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors focus-visible:outline-primary"
        >
          <Plus className="size-4" />
          <span>Tugaskan Staf Baru</span>
        </button>
      </div>

      {/* Kad Ringkasan Penugasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jumlah Staf Pembimbing
            </span>
            <div className="rounded-xl bg-[var(--success-bg)] p-2 text-[var(--success)]">
              <UserCheck className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">{staffList.length} Orang</p>
          <p className="mt-1 text-xs text-muted-foreground">100% kumpulan mempunyai pembimbing</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Kumpulan Asrama Aktif
            </span>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Building2 className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">3 Kumpulan HE</p>
          <p className="mt-1 text-xs text-muted-foreground">Mevlana HE · Razi HE · Fatih HE</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Purata Kutipan Kumpulan
            </span>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">81.7%</p>
          <p className="mt-1 text-xs text-[var(--success)] font-medium">49 daripada 60 Siswa lunas</p>
        </div>
      </div>

      {/* Carian & Penapis Staf */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama ustaz, grup, atau email..."
              className="w-full rounded-xl border border-input bg-card py-2 pl-9 pr-4 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            Menunjukkan {filteredStaff.length} daripada {staffList.length} staf
          </span>
        </div>

        {/* Senarai Kad Staf */}
        <div className="divide-y divide-border">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-2xl bg-[var(--success-bg)] text-[var(--success)] font-bold flex items-center justify-center shrink-0 border border-[var(--success-border)] text-base">
                  {staff.nama
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-foreground">{staff.nama}</h3>
                    <span className="inline-flex items-center rounded-md bg-[var(--success-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--success)] border border-[var(--success-border)]">
                      {staff.grup}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800">
                      <span className="size-1.5 rounded-full bg-green-500" />
                      {staff.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{staff.jawatan}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="size-3.5 text-muted-foreground" />
                      {staff.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="size-3.5 text-muted-foreground" />
                      {staff.telefon}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistik Kutipan & Tindakan */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                <div className="min-w-44">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Kutipan {staff.grup}</span>
                    <span className="font-bold text-[var(--success)]">{staff.kadarKutipan}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                      style={{ width: `${staff.kadarKutipan}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{staff.bilanganSiswa} Siswa</span>
                    <span>RM {staff.jumlahKutipan.toLocaleString()} / RM {staff.sasaranKutipan.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(staff)}
                    className="rounded-xl border border-input bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Ubah Penugasan
                  </button>
                  <Link
                    href={`/admin?tab=siswa&grup=${encodeURIComponent(staff.grup)}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-[var(--success-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--success)] hover:bg-[var(--success-bg)] transition-colors"
                  >
                    <span>Lihat Siswa</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Ubah / Tambah Penugasan */}
      {showAssignModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {selectedStaff ? "Ubah Penugasan Staf" : "Tugaskan Staf Baru"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedStaff
                    ? `Kemaskini maklumat dan grup bimbingan untuk ${selectedStaff.nama}`
                    : "Daftar ustaz pembimbing ke dalam sistem asrama"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAssignment} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Nama Penuh Ustaz / Staf</label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="cth: Ustaz Mohd Danial"
                  className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@yuran.demo"
                    className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">No. Telefon</label>
                  <input
                    type="text"
                    value={formTelefon}
                    onChange={(e) => setFormTelefon(e.target.value)}
                    placeholder="+60 1X-XXX XXXX"
                    className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Kumpulan Asrama Ditugaskan</label>
                <select
                  value={formGrup}
                  onChange={(e) => setFormGrup(e.target.value as StaffAssignment["grup"])}
                  className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="Mevlana HE">Mevlana HE (20 Siswa)</option>
                  <option value="Razi HE">Razi HE (20 Siswa)</option>
                  <option value="Fatih HE">Fatih HE (20 Siswa)</option>
                </select>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Staf akan bertanggungjawab mencatat bayaran yuran dan mengesahkan orang tua bagi kumpulan ini.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {selectedStaff ? "Simpan Perubahan" : "Sahkan Penugasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
