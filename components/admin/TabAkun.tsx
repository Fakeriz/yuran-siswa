"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Link as LinkIcon,
  Trash2,
  CheckCircle2,
  Search,
  Mail,
  User,
  Key,
} from "lucide-react";

export interface AccountItem {
  id: string;
  nama: string;
  email: string;
  peran: "admin" | "staff" | "orang_tua";
  tarikhDicipta: string;
  anakDihubung?: string[];
}

const INITIAL_ACCOUNTS: AccountItem[] = [
  {
    id: "acc-1",
    nama: "Administrator Utama",
    email: "admin@yuran.demo",
    peran: "admin",
    tarikhDicipta: "01 Jan 2026",
  },
  {
    id: "acc-2",
    nama: "Ustaz Ahmad Farhan",
    email: "farhan@yuran.demo",
    peran: "staff",
    tarikhDicipta: "15 Jan 2026",
  },
  {
    id: "acc-3",
    nama: "Ustaz Mohd Haziq",
    email: "haziq@yuran.demo",
    peran: "staff",
    tarikhDicipta: "15 Jan 2026",
  },
  {
    id: "acc-4",
    nama: "Ustaz Luqman Hakim",
    email: "luqman@yuran.demo",
    peran: "staff",
    tarikhDicipta: "20 Jan 2026",
  },
  {
    id: "acc-5",
    nama: "Hassan bin Abdullah",
    email: "hassan.abd@gmail.com",
    peran: "orang_tua",
    tarikhDicipta: "01 Feb 2026",
    anakDihubung: ["Ahmad bin Ali"],
  },
  {
    id: "acc-6",
    nama: "Khadijah binti Ismail",
    email: "khadijah.ismail@yahoo.com",
    peran: "orang_tua",
    tarikhDicipta: "05 Feb 2026",
    anakDihubung: ["Siti Nurhaliza"],
  },
  {
    id: "acc-7",
    nama: "Datin Salmah binti Othman",
    email: "salmah.othman@gmail.com",
    peran: "orang_tua",
    tarikhDicipta: "10 Feb 2026",
    anakDihubung: ["Nur Aisyah"],
  },
];

export function TabAkun() {
  const [accounts, setAccounts] = useState<AccountItem[]>(INITIAL_ACCOUNTS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"semua" | "admin" | "staff" | "orang_tua">("semua");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states create account
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [peran, setPeran] = useState<AccountItem["peran"]>("orang_tua");

  // Form states link child
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedChildName, setSelectedChildName] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filtered = accounts.filter((acc) => {
    const matchRole = filterRole === "semua" || acc.peran === filterRole;
    const matchSearch =
      acc.nama.toLowerCase().includes(search.toLowerCase()) ||
      acc.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim() || password.length < 8) return;

    const newAcc: AccountItem = {
      id: `acc-${Date.now()}`,
      nama: nama.trim(),
      email: email.trim(),
      peran,
      tarikhDicipta: "04 Okt 2026",
      anakDihubung: peran === "orang_tua" ? [] : undefined,
    };

    setAccounts([newAcc, ...accounts]);
    showToast(`Akaun ${newAcc.nama} (${newAcc.peran}) berjaya dicipta.`);
    setShowCreateModal(false);
    setNama("");
    setEmail("");
    setPassword("");
  };

  const handleLinkChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId || !selectedChildName.trim()) return;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === selectedParentId) {
          const currentLinks = acc.anakDihubung || [];
          if (!currentLinks.includes(selectedChildName)) {
            return { ...acc, anakDihubung: [...currentLinks, selectedChildName] };
          }
        }
        return acc;
      })
    );

    const parent = accounts.find((a) => a.id === selectedParentId);
    showToast(`Anak ${selectedChildName} berjaya dihubungkan ke akaun ${parent?.nama}.`);
    setShowLinkModal(false);
    setSelectedParentId("");
    setSelectedChildName("");
  };

  const handleUnlinkChild = (accountId: string, childName: string) => {
    if (!window.confirm(`Lepaskan hubungan anak ${childName} dari akaun ini?`)) return;
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? { ...acc, anakDihubung: (acc.anakDihubung || []).filter((c) => c !== childName) }
          : acc
      )
    );
    showToast(`Hubungan anak ${childName} berjaya dilepaskan.`);
  };

  const parentAccounts = accounts.filter((a) => a.peran === "orang_tua");

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Butang Tindakan */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Pengurusan Akaun Pengguna
            </h1>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
              {accounts.length} Akaun
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Daftar akaun staf atau ibu bapa baharu dan urus pautan anak didik secara langsung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
          >
            <LinkIcon className="size-3.5 text-gray-500" />
            <span>Hubungkan Anak</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 transition-colors focus-visible:outline-emerald-600"
          >
            <UserPlus className="size-4" />
            <span>Cipta Akaun Baharu</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Peranan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Akaun Ibu Bapa
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-800">
              <Users className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {accounts.filter((a) => a.peran === "orang_tua").length} Pengguna
          </p>
          <p className="mt-1 text-xs text-gray-500">Akses pemantauan yuran & resit anak</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Staf Asrama (Ustaz)
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-800">
              <ShieldCheck className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-800">
            {accounts.filter((a) => a.peran === "staff").length} Pengguna
          </p>
          <p className="mt-1 text-xs text-gray-500">Pencatat bayaran & pembimbing grup</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Pentadbir (Admin)
            </span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-800">
              <Key className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {accounts.filter((a) => a.peran === "admin").length} Pengguna
          </p>
          <p className="mt-1 text-xs text-gray-500">Kawalan penuh sistem & kwitansi rasmi</p>
        </div>
      </div>

      {/* Toolbar Carian & Penapis */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau emel pengguna..."
              className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-2 pl-9 pr-4 text-xs text-gray-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 border border-gray-200/80">
            {(
              [
                ["semua", "Semua Peranan"],
                ["orang_tua", "Ibu Bapa"],
                ["staff", "Staf"],
                ["admin", "Admin"],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setFilterRole(val)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterRole === val
                    ? "bg-white text-emerald-800 shadow-2xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Jadual Akaun */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th scope="col" className="px-5 py-3.5">Pengguna</th>
                <th scope="col" className="px-5 py-3.5">Emel</th>
                <th scope="col" className="px-5 py-3.5 text-center">Peranan</th>
                <th scope="col" className="px-5 py-3.5">Anak Dihubungkan</th>
                <th scope="col" className="px-5 py-3.5 text-right">Tarikh Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                        {acc.nama.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900">{acc.nama}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-600">
                    {acc.email}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        acc.peran === "admin"
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : acc.peran === "staff"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {acc.peran === "admin" ? "Pentadbir" : acc.peran === "staff" ? "Staf Asrama" : "Ibu Bapa"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {acc.peran === "orang_tua" ? (
                      acc.anakDihubung && acc.anakDihubung.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {acc.anakDihubung.map((anak) => (
                            <span
                              key={anak}
                              className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                            >
                              <span>{anak}</span>
                              <button
                                type="button"
                                onClick={() => handleUnlinkChild(acc.id, anak)}
                                className="text-gray-400 hover:text-rose-600 ml-0.5"
                                title="Lepas hubungan anak"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Belum ada anak dihubungkan</span>
                      )
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right text-xs text-gray-500">
                    {acc.tarikhDicipta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cipta Akaun Baharu */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Cipta Akaun Baharu</h3>
                <p className="text-xs text-gray-500">Daftarkan akaun staf atau ibu bapa ke dalam sistem.</p>
              </div>
            </div>

            <form onSubmit={handleCreateAccount} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700">Nama Penuh</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="cth: Haji Ahmad bin Mansor"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Alamat Emel</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pengguna@emel.com"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Kata Laluan (Min. 8 Aksara)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Peranan Pengguna</label>
                <select
                  value={peran}
                  onChange={(e) => setPeran(e.target.value as AccountItem["peran"])}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                >
                  <option value="orang_tua">Ibu Bapa / Penjaga</option>
                  <option value="staff">Staf Asrama (Ustaz Pembimbing)</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900"
                >
                  Cipta Akaun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hubungkan Anak Secara Manual */}
      {showLinkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setShowLinkModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Hubungkan Anak Didik</h3>
                <p className="text-xs text-gray-500">Pautkan anak kepada akaun ibu bapa berdaftar secara serta-merta.</p>
              </div>
            </div>

            <form onSubmit={handleLinkChild} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700">Pilih Akaun Ibu Bapa</label>
                <select
                  required
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                >
                  <option value="">-- Pilih Ibu Bapa --</option>
                  {parentAccounts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Pilih Anak (Talebe)</label>
                <select
                  required
                  value={selectedChildName}
                  onChange={(e) => setSelectedChildName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                >
                  <option value="">-- Pilih Talebe --</option>
                  <option value="Ahmad bin Ali">Ahmad bin Ali (Mevlana HE · Tahun 1 Amanah)</option>
                  <option value="Siti Nurhaliza">Siti Nurhaliza (Mevlana HE · Tahun 2 Bestari)</option>
                  <option value="Muhammad Faiz">Muhammad Faiz (Razi HE · Tahun 3 Cerdas)</option>
                  <option value="Danial Hakimi">Danial Hakimi (Razi HE · Tahun 2 Bestari)</option>
                  <option value="Nur Aisyah">Nur Aisyah (Fatih HE · Tahun 1 Amanah)</option>
                  <option value="Mohd Rizal">Mohd Rizal (Fatih HE · Tahun 2 Bestari)</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedParentId || !selectedChildName}
                  className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 disabled:opacity-50"
                >
                  Sahkan Pautan Anak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
