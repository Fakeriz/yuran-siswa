"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { approveParentLink, createAccount, deleteStudent, linkChild, listAdminData, saveStudent, unlinkChild } from "../../lib/actions/admin";
import { uploadKwitansi } from "../../lib/actions/payments";
import { UserBar } from "../../components/user-bar";

type Data = Awaited<ReturnType<typeof listAdminData>>;
type Result = { ok: true } | { ok: false; error: string };
const field = "mt-2 block min-h-12 w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";
const card = "rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800";
const text = (data: FormData, key: string) => String(data.get(key) ?? "");
const money = (amount: number) => `RM ${Number(amount).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function ActionForm({ children, action, label = "Simpan", confirm, disabled = false }: { children?: ReactNode; action: (data: FormData) => Promise<Result>; label?: string; confirm?: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  const router = useRouter();
  return <form className="space-y-4" aria-busy={pending} onSubmit={(event) => {
    event.preventDefault();
    if (pending || (confirm && !window.confirm(confirm))) return;
    const data = new FormData(event.currentTarget);
    setResult(null);
    startTransition(async () => {
      try { const next = await action(data); setResult(next); if (next.ok) router.refresh(); }
      catch { setResult({ ok: false, error: "Perubahan gagal dikirim. Silakan coba lagi." }); }
    });
  }}><fieldset disabled={pending || disabled} className="space-y-4 disabled:opacity-60">{children}<button className="min-h-12 rounded-2xl bg-emerald-800 px-5 py-2 font-medium text-white transition-colors duration-150 hover:bg-emerald-900 disabled:opacity-60">{pending ? "Menyimpan…" : label}</button></fieldset>{result && <p role={result.ok ? "status" : "alert"} className={`rounded-2xl p-3 text-sm ${result.ok ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" : "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200"}`}>{result.ok ? "Perubahan berhasil disimpan." : result.error}</p>}</form>;
}
function StudentFields({ student }: { student?: Data["students"][number] }) {
  return <><label className="block text-sm font-medium">Nama<input name="nama" required defaultValue={student?.nama} className={field} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Grup<input name="grup" required defaultValue={student?.grup} className={field} /></label><label className="block text-sm font-medium">Kelas<input name="kelas" required defaultValue={student?.kelas} className={field} /></label></div><label className="block text-sm font-medium">Yuran per bulan (RM)<input name="yuran" required type="number" min="0" step="0.01" defaultValue={student?.yuran_per_bulan} className={field} /></label><label className="flex min-h-12 items-center gap-3"><input name="aktif" type="checkbox" defaultChecked={student?.is_active ?? true} className="size-5 accent-emerald-800" />Siswa aktif</label></>;
}
function studentInput(form: FormData) { return { nama: text(form, "nama"), grup: text(form, "grup"), kelas: text(form, "kelas"), yuran_per_bulan: Number(form.get("yuran")), is_active: form.has("aktif") }; }

export const tabs = [
  ["persetujuan", "Persetujuan"],
  ["penugasan", "Penugasan staff"],
  ["siswa", "Siswa"],
  ["akun", "Akun"],
  ["kwitansi", "Kwitansi"],
] as const;

export function AdminPanel({ initialTab, data }: { initialTab?: string; data: Data }) {
  const [activeTab, setActiveTab] = useState<string>(
    tabs.find(([id]) => id === initialTab)?.[0] ?? "persetujuan"
  );
  const studentName = (id: string) => data.students.find((s) => s.id === id)?.nama ?? "Siswa tidak tersedia";
  const profileName = (id: string) => data.profiles.find((p) => p.id === id)?.nama ?? "Akun tidak tersedia";
  const parents = data.profiles.filter((p) => p.peran === "orang_tua");
  const [query, setQuery] = useState("");

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-emerald-700">
      <UserBar userRole="admin" userName="Administrator Demo" title="Yuran Siswa · Panel Admin" />
      <div className="flex-1 md:grid md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-zinc-200 p-6 dark:border-zinc-800 md:border-r md:border-b-0">
          <p className="text-lg font-semibold">Menu Admin</p>
          <nav aria-label="Tab administrasi" className="mt-6 flex flex-wrap gap-2 md:flex-col">
            {tabs.map(([id, title]) => (
              <button
                type="button"
                key={id}
                onClick={() => handleTabClick(id)}
                aria-current={activeTab === id ? "page" : undefined}
                className={`rounded-2xl px-4 py-3 text-sm text-left font-medium transition-colors duration-150 ${
                  activeTab === id
                    ? "bg-emerald-800 text-white"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                {title}
              </button>
            ))}
          </nav>
        </aside>
        <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-8 sm:px-8 md:py-12">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Administrasi</p>
          <h1 className="mt-2 text-3xl font-semibold">
            {tabs.find(([id]) => id === activeTab)?.[1]}
          </h1>

        {activeTab === "persetujuan" && (
          <div className="mt-8 space-y-4">
            {!data.links.filter((link) => link.status === "pending" && !link.approved_by).length && (
              <p className={card}>Tidak ada pengajuan yang menunggu keputusan.</p>
            )}
            {data.links
              .filter((link) => link.status === "pending" && !link.approved_by)
              .map((link) => (
                <article key={link.id} className={card}>
                  <h2 className="break-words text-lg font-semibold">
                    {profileName(link.parent_id)} · {studentName(link.student_id)}
                  </h2>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                    Orang tua yang sudah disetujui:{" "}
                    {data.links
                      .filter((other) => other.student_id === link.student_id && other.status === "approved")
                      .map((other) => profileName(other.parent_id))
                      .join(", ") || "Belum ada"}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <ActionForm label="Setuju" action={() => approveParentLink(link.id, true)} />
                    <ActionForm label="Tolak" confirm="Tolak pengajuan ini?" action={() => approveParentLink(link.id, false)} />
                  </div>
                </article>
              ))}
          </div>
        )}

        {activeTab === "penugasan" && (
          <div className="mt-8 space-y-3">
            <p className="text-zinc-600 dark:text-zinc-400">
              Penugasan dipilih langsung oleh staf. Daftar ini hanya untuk dilihat.
            </p>
            {!data.groups.length && <p className={card}>Belum ada penugasan grup.</p>}
            {data.groups.map((group) => (
              <div key={`${group.staff_id}-${group.grup}`} className={`${card} flex flex-wrap justify-between gap-3`}>
                <span className="break-words font-medium">{profileName(group.staff_id)}</span>
                <span className="break-words">{group.grup}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "siswa" && (
          <div className="mt-8 space-y-5">
            <details className={card}>
              <summary className="cursor-pointer font-semibold">Tambah siswa</summary>
              <div className="mt-5">
                <ActionForm action={(form) => saveStudent(studentInput(form))}>
                  <StudentFields />
                </ActionForm>
              </div>
            </details>
            <label className="block font-medium">
              Cari siswa
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className={field} />
            </label>
            {!data.students.some((s) => s.nama.toLowerCase().includes(query.toLowerCase())) ? (
              <p className={card}>Tidak ada siswa yang cocok.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Data siswa</caption>
                  <thead className="bg-zinc-50 dark:bg-zinc-900">
                    <tr>
                      {["Siswa", "Kelas / grup", "Yuran bulanan", "Status", "Kelola"].map((label) => (
                        <th key={label} scope="col" className="px-4 py-4 font-medium">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {data.students
                      .filter((s) => s.nama.toLowerCase().includes(query.toLowerCase()))
                      .map((student) => (
                        <tr key={student.id}>
                          <th scope="row" className="px-4 py-4 font-medium">{student.nama}</th>
                          <td className="px-4 py-4">{student.kelas}<span className="block text-zinc-600 dark:text-zinc-400">{student.grup}</span></td>
                          <td className="whitespace-nowrap px-4 py-4">{money(student.yuran_per_bulan)}</td>
                          <td className="px-4 py-4">{student.is_active ? "Aktif" : "Nonaktif"}</td>
                          <td className="px-4 py-4">
                            <details>
                              <summary className="cursor-pointer rounded-lg py-3 font-medium text-emerald-800 dark:text-emerald-300">Edit</summary>
                              <div className="mt-4 min-w-56 space-y-6">
                                <ActionForm action={(form) => saveStudent({ id: student.id, ...studentInput(form) })}>
                                  <StudentFields student={student} />
                                </ActionForm>
                                <ActionForm
                                  label="Hapus siswa"
                                  confirm={`Hapus ${student.nama}? Hubungan orang tua juga akan dilepas. Jika ada riwayat pembayaran, nonaktifkan siswa.`}
                                  action={() => deleteStudent(student.id)}
                                />
                              </div>
                            </details>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "akun" && (
          <div className="mt-8 space-y-6">
            <details className={card}>
              <summary className="cursor-pointer font-semibold">Buat akun</summary>
              <div className="mt-5">
                <ActionForm
                  label="Buat akun"
                  action={(form) =>
                    createAccount({
                      nama: text(form, "nama"),
                      email: text(form, "email"),
                      password: text(form, "password"),
                      peran: text(form, "peran") as "staff" | "orang_tua",
                    })
                  }
                >
                  <label className="block">Nama<input name="nama" required className={field} /></label>
                  <label className="block">Email<input name="email" type="email" required autoComplete="off" className={field} /></label>
                  <label className="block">Kata sandi<input name="password" type="password" minLength={8} required autoComplete="new-password" className={field} /></label>
                  <label className="block">Peran<select name="peran" className={field}><option value="orang_tua">Orang tua</option><option value="staff">Staff</option></select></label>
                </ActionForm>
              </div>
            </details>
            <section className={card}>
              <h2 className="mb-5 text-lg font-semibold">Hubungkan anak</h2>
              <ActionForm
                disabled={!parents.length || !data.students.length}
                label="Hubungkan"
                action={(form) => linkChild(text(form, "parent"), text(form, "student"))}
              >
                <label className="block">
                  Orang tua
                  <select name="parent" required className={field}>
                    <option value="">Pilih orang tua</option>
                    {parents.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </label>
                <label className="block">
                  Anak
                  <select name="student" required className={field}>
                    <option value="">Pilih anak</option>
                    {data.students.map((s) => <option key={s.id} value={s.id}>{s.nama} · {s.kelas}</option>)}
                  </select>
                </label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Hubungan yang dibuat admin langsung disetujui. Hubungan orang tua lain tetap dipertahankan.</p>
              </ActionForm>
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Daftar akun</h2>
              {data.profiles.map((p) => (
                <article key={p.id} className={card}>
                  <h3 className="font-semibold">
                    {p.nama}{" "}
                    <span className="font-normal text-zinc-600 dark:text-zinc-400">
                      ({p.peran === "orang_tua" ? "Orang tua" : p.peran === "staff" ? "Staff" : "Admin"})
                    </span>
                  </h3>
                  {data.links
                    .filter((link) => link.parent_id === p.id)
                    .map((link) => (
                      <div key={link.id} className="mt-4 space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                        <p>{studentName(link.student_id)} · {link.status === "approved" ? "Disetujui" : link.approved_by ? "Ditolak" : "Menunggu persetujuan"}</p>
                        <ActionForm label="Lepas anak" confirm="Lepas hubungan anak dari akun ini?" action={() => unlinkChild(link.id)} />
                      </div>
                    ))}
                </article>
              ))}
            </section>
          </div>
        )}

        {activeTab === "kwitansi" && (
          <section className={`mt-8 ${card}`}>
            <h2 className="mb-5 text-lg font-semibold">Upload kwitansi</h2>
            {!data.payments.filter((p) => !p.kwitansi_drive_file_id).length ? (
              <p>Tidak ada pembayaran yang menunggu kwitansi.</p>
            ) : (
              <ActionForm label="Upload kwitansi" action={(form) => uploadKwitansi(text(form, "payment"), form.get("file") as File)}>
                <label className="block">
                  Pembayaran
                  <select name="payment" required className={field}>
                    <option value="">Pilih pembayaran</option>
                    {data.payments
                      .filter((p) => !p.kwitansi_drive_file_id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {studentName(p.student_id)} · {months[p.bulan - 1]} {p.tahun} · {money(p.jumlah)}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="block">
                  File kwitansi
                  <input name="file" type="file" accept="image/*,application/pdf" required className={field} />
                </label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Gambar atau PDF, maksimal 10 MB.</p>
              </ActionForm>
            )}
          </section>
        )}
      </main>
      </div>
    </div>
  );
}
