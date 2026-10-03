"use client";

import { useState, useTransition } from "react";
import { registerParent } from "../../../lib/actions/admin";

export function RegisterForm({ students }: { students: { id: string; nama: string; kelas: string }[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const field = "mt-2 block min-h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900";
  if (saved) return <section className="mt-8 rounded-2xl border border-emerald-300 p-5 dark:border-emerald-800" role="status"><h2 className="font-semibold">menunggu persetujuan</h2><p className="mt-2">Pendaftaran berhasil. Pengajuan anak akan diperiksa oleh admin atau staf. Jika menerima email konfirmasi, konfirmasikan email sebelum masuk.</p></section>;
  return <form className="mt-8 space-y-5 [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-emerald-700" aria-busy={pending} onSubmit={(event) => {
    event.preventDefault();
    if (pending) return;
    if (!selected.length) { setMessage("Pilih minimal satu anak."); return; }
    const data = new FormData(event.currentTarget);
    setMessage("");
    startTransition(async () => {
      try {
        const result = await registerParent({ nama: String(data.get("nama")), email: String(data.get("email")), password: String(data.get("password")), student_ids: selected });
        if (result.ok) setSaved(true); else setMessage(result.error);
      } catch { setMessage("Pendaftaran gagal dikirim. Silakan coba lagi."); }
    });
  }}>
    <fieldset disabled={pending} className="space-y-5 disabled:opacity-60">
      <label className="block font-medium">Nama<input name="nama" autoComplete="name" required className={field} /></label>
      <label className="block font-medium">Email<input name="email" type="email" autoComplete="email" required className={field} /></label>
      <label className="block font-medium">Kata sandi<input name="password" type="password" autoComplete="new-password" required minLength={8} aria-describedby="password-hint" className={field} /></label>
      <p id="password-hint" className="text-sm text-zinc-600 dark:text-zinc-400">Minimal 8 karakter.</p>
      <fieldset>
        <legend className="font-medium">Pilih anak (boleh lebih dari satu)</legend>
        <label className="mt-3 block text-sm">Cari nama atau kelas<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className={field} /></label>
        <p className="my-3 text-sm" role="status">{selected.length} anak dipilih</p>
        <div className="max-h-64 overflow-y-auto rounded-2xl border border-zinc-300 p-2 dark:border-zinc-700">
          {!students.length && <p className="p-3">Belum ada siswa yang dapat dipilih.</p>}
          {students.length > 0 && !students.some((s) => `${s.nama} ${s.kelas}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())) && <p className="p-3">Tidak ada siswa yang cocok.</p>}
          {students.filter((s) => `${s.nama} ${s.kelas}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map((student) => <label key={student.id} className="flex min-h-12 items-center gap-3 rounded-xl p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900"><input type="checkbox" checked={selected.includes(student.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, student.id] : selected.filter((id) => id !== student.id))} className="size-5 shrink-0 accent-emerald-800" /><span className="break-words">{student.nama}<span className="block text-sm text-zinc-600 dark:text-zinc-400">{student.kelas}</span></span></label>)}
        </div>
      </fieldset>
    </fieldset>
    {message && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">{message}</p>}
    <button disabled={pending || !students.length} className="min-h-12 w-full rounded-2xl bg-emerald-800 px-4 py-3 font-semibold text-white transition-colors duration-150 hover:bg-emerald-900 disabled:opacity-60">{pending ? "Mendaftar…" : "Daftar"}</button>
  </form>;
}
