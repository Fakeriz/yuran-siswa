"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignGroups } from "../../../lib/actions/staff";

export function GroupForm({ groups, initialSelected }: { groups: string[]; initialSelected: string[] }) {
  const [selected, setSelected] = useState(initialSelected);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return <form className="mt-8 space-y-5" aria-busy={pending} onSubmit={(event) => {
    event.preventDefault();
    if (pending) return;
    setMessage("");
    startTransition(async () => {
      try {
        const result = await assignGroups(selected);
        setSuccess(result.ok);
        setMessage(result.ok ? "Pilihan grup berhasil disimpan." : result.error);
        if (result.ok) router.refresh();
      } catch { setSuccess(false); setMessage("Grup gagal disimpan. Periksa koneksi dan coba lagi."); }
    });
  }}>
    <fieldset disabled={pending} className="space-y-3 disabled:opacity-60">
      <legend className="mb-3 font-medium">Grup Anda</legend>
      {!groups.length && <p className="rounded-2xl border border-border p-5">Belum ada grup tersedia. Hubungi admin untuk menambahkan data siswa.</p>}
      {groups.map((group) => <label key={group} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-border px-4 py-3 transition-colors duration-150 hover:bg-muted">
        <input type="checkbox" checked={selected.includes(group)} onChange={(event) => { setMessage(""); setSelected(event.target.checked ? [...selected, group] : selected.filter((item) => item !== group)); }} className="size-5 shrink-0 accent-primary" />
        <span className="min-w-0 break-words">{group}</span>
      </label>)}
    </fieldset>
    <p className="text-sm text-muted-foreground">Kosongkan semua pilihan untuk melepas seluruh grup Anda.</p>
    {message && <p role={success ? "status" : "alert"} className={`rounded-2xl p-4 ${success ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-destructive/10 text-destructive"}`}>{message}</p>}
    <button disabled={pending || !groups.length} className="min-h-12 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">{pending ? "Menyimpan…" : "Simpan"}</button>
  </form>;
}
