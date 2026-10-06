"use client";

import { useState } from "react";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Mail,
  User,
  ShieldCheck,
  Info,
} from "lucide-react";

export interface ParentClaim {
  id: string;
  namaIbuBapa: string;
  emailOrangTua: string;
  telefonIbuBapa: string;
  namaSiswa: string;
  kelasSiswa: string;
  grupSiswa: string;
  tarikhMohon: string;
  status: "pending" | "approved" | "rejected";
  disahkanOleh?: string;
  ibuBapaSediaAda?: string; // Jika sudah ada penjaga lain
}

const INITIAL_CLAIMS: ParentClaim[] = [
  {
    id: "claim-1",
    namaIbuBapa: "Hassan bin Abdullah",
    emailOrangTua: "hassan.abd@gmail.com",
    telefonIbuBapa: "+60 12-456 7890",
    namaSiswa: "Ahmad bin Ali",
    kelasSiswa: "Tahun 1 Amanah",
    grupSiswa: "Mevlana HE",
    tarikhMohon: "03 Okt 2026, 09:30 AM",
    status: "pending",
  },
  {
    id: "claim-2",
    namaIbuBapa: "Khadijah binti Ismail",
    emailOrangTua: "khadijah.ismail@yahoo.com",
    telefonIbuBapa: "+60 19-876 5432",
    namaSiswa: "Mohd Amirul Afiq Bin Haris",
    kelasSiswa: "Tahun 2 Bestari",
    grupSiswa: "Mevlana HE",
    tarikhMohon: "02 Okt 2026, 02:15 PM",
    status: "pending",
    ibuBapaSediaAda: "Haji Ismail (Bapa)",
  },
  {
    id: "claim-3",
    namaIbuBapa: "Zulkifli bin Hashim",
    emailOrangTua: "zul.hashim@outlook.com",
    telefonIbuBapa: "+60 17-321 0987",
    namaSiswa: "Muhammad Danish Danial bin Abdullah",
    kelasSiswa: "Tahun 3 Cerdas",
    grupSiswa: "Razi HE",
    tarikhMohon: "01 Okt 2026, 11:45 AM",
    status: "pending",
  },
  {
    id: "claim-4",
    namaIbuBapa: "Datin Salmah binti Othman",
    emailOrangTua: "salmah.othman@gmail.com",
    telefonIbuBapa: "+60 11-123 4567",
    namaSiswa: "Muhammad Haziq Hashari Bin Mohd Norhan",
    kelasSiswa: "Tahun 1 Amanah",
    grupSiswa: "Fatih HE",
    tarikhMohon: "28 Sep 2026",
    status: "approved",
    disahkanOleh: "Ustaz Farhan (Admin)",
  },
  {
    id: "claim-5",
    namaIbuBapa: "Ramli bin Kassim",
    emailOrangTua: "ramli.kassim@gmail.com",
    telefonIbuBapa: "+60 13-445 5667",
    namaSiswa: "Danial Hakimi",
    kelasSiswa: "Tahun 2 Bestari",
    grupSiswa: "Razi HE",
    tarikhMohon: "25 Sep 2026",
    status: "approved",
    disahkanOleh: "Ustaz Haziq (Admin)",
  },
];

export function TabPersetujuan() {
  const [claims, setClaims] = useState<ParentClaim[]>(INITIAL_CLAIMS);
  const [filterStatus, setFilterStatus] = useState<"semua" | "pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDecision = (id: string, decision: "approved" | "rejected") => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: decision,
              disahkanOleh: decision === "approved" ? "Admin Asrama (Admin)" : undefined,
            }
          : c
      )
    );
    const claim = claims.find((c) => c.id === id);
    if (decision === "approved") {
      showToast(`Permohonan ${claim?.namaIbuBapa} untuk ${claim?.namaSiswa} telah DISAHKAN.`);
    } else {
      showToast(`Permohonan ${claim?.namaIbuBapa} untuk ${claim?.namaSiswa} telah DITOLAK.`);
    }
  };

  const handleUnlink = (id: string) => {
    if (!window.confirm("Apakah Anda yakin untuk memutuskan hubungan akun orang tua ini?")) return;
    setClaims((prev) => prev.filter((c) => c.id !== id));
    showToast("Hubungan anak dan orang tua telah berhasil diputuskan.");
  };

  const pendingCount = claims.filter((c) => c.status === "pending").length;
  const approvedCount = claims.filter((c) => c.status === "approved").length;

  const filtered = claims.filter((c) => {
    const matchStatus = filterStatus === "semua" || c.status === filterStatus;
    const matchSearch =
      c.namaIbuBapa.toLowerCase().includes(search.toLowerCase()) ||
      c.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
      c.emailOrangTua.toLowerCase().includes(search.toLowerCase()) ||
      c.grupSiswa.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Pengesahan Pendaftaran Orang Tua
            </h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                {pendingCount} Menunggu
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Sahkan permohonan pendaftaran akun orang tua yang mengklaim siswa mereka.
          </p>
        </div>
      </div>

      {/* Ringkasan Status Tab */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Menunggu Keputusan
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-800">
              <AlertCircle className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-800">{pendingCount} Permohonan</p>
          <p className="mt-1 text-xs text-muted-foreground">Perlu diperiksa & disahkan oleh admin</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Telah Disahkan (Aktif)
            </span>
            <div className="rounded-xl bg-green-50 p-2 text-green-800">
              <UserCheck className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[var(--success)]">{approvedCount} Hubungan</p>
          <p className="mt-1 text-xs text-muted-foreground">Orang tua mempunyai akses portal rasmi</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jumlah Rekod Tuntutan
            </span>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <ShieldCheck className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground">{claims.length} Rekod</p>
          <p className="mt-1 text-xs text-muted-foreground">Sistem pendaftaran Siswa Sesi 2026/2027</p>
        </div>
      </div>

      {/* Toolbar Filter & Carian */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-card">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari orang tua, siswa, atau email..." className="w-full rounded-xl border border-input bg-muted/50 py-2 pl-9 pr-4 text-xs text-foreground focus:border-primary focus:bg-card focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-muted p-1 border border-border/80">
            {(
              [
                ["pending", `Menunggu (${pendingCount})`],
                ["approved", `Disahkan (${approvedCount})`],
                ["semua", "Semua"],
              ] as const
            ).map(([val, label]) => (
              <button key={val}
                type="button" onClick={() => setFilterStatus(val)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterStatus === val
                    ? "bg-card text-[var(--success)] shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Senarai Permohonan */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto size-8 text-[var(--success)] mb-2" />
            <p className="text-sm font-semibold text-foreground">
              {filterStatus === "pending"
                ? "Tiada permohonan yang menunggu pengesahan!"
                : "Tiada rekod dijumpai mengikut tapisan."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Semua akun orang tua telah diperiksa dan diperbarui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((claim) => (
              <div key={claim.id}
                className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="size-11 rounded-2xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 border border-amber-200 text-sm">
                    {claim.namaIbuBapa.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-foreground">{claim.namaIbuBapa}</h3>
                      {claim.status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                          <AlertCircle className="size-3" />
                          <span>Menunggu Pengesahan</span>
                        </span>
                      )}
                      {claim.status === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 border border-green-200">
                          <CheckCircle2 className="size-3" />
                          <span>Telah Disahkan</span>
                        </span>
                      )}
                      {claim.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 border border-rose-200">
                          <XCircle className="size-3" />
                          <span>Ditolak</span>
                        </span>
                      )}
                    </div>

                    {/* Maklumat Anak yang Dituntut */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-muted-foreground">Tuntut Anak:</span>
                      <span className="text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">
                        {claim.namaSiswa}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">({claim.kelasSiswa} · {claim.grupSiswa})</span>
                    </div>

                    {claim.ibuBapaSediaAda && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 max-w-fit">
                        <Info className="size-3.5 shrink-0" />
                        <span>Perhatian: Siswa ini sudah mempunyai penjaga berdaftar: <strong>{claim.ibuBapaSediaAda}</strong></span>
                      </div>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{claim.emailOrangTua}</span>
                      <span>·</span>
                      <span>{claim.telefonIbuBapa}</span>
                      <span>·</span>
                      <span>Dimohon pada: {claim.tarikhMohon}</span>
                      {claim.disahkanOleh && (
                        <>
                          <span>·</span>
                          <span className="text-[var(--success)] font-medium">Disahkan oleh: {claim.disahkanOleh}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Butang Tindakan Keputusan */}
                <div className="flex items-center gap-2 lg:gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                  {claim.status === "pending" ? (
                    <>
                      <button type="button" onClick={() => handleDecision(claim.id, "approved")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Sahkan Hubungan</span>
                      </button>
                      <button type="button" onClick={() => handleDecision(claim.id, "rejected")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-colors"
                      >
                        <XCircle className="size-3.5" />
                        <span>Tolak</span>
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => handleUnlink(claim.id)}
                      className="rounded-xl border border-input bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-rose-600 transition-colors"
                    >
                      Lepas Hubungan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
