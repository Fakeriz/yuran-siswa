"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordPayment } from "../../lib/actions/payments";
import type { Student } from "../../lib/types";

const field = "mt-2 block min-h-11 w-full rounded-2xl border border-input bg-card px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function PaymentForm({ student, bulan, tahun, period, today }: {
  student: Student; bulan: number; tahun: number; period: string; today: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const titleId = useId();

  function close() {
    dialog.current?.close();
  }

  function submit(data: FormData) {
    if (pending || saved) return;
    const bukti = data.get("bukti");
    if (!(bukti instanceof File) || !bukti.size) {
      setMessage("Pilih file bukti pembayaran.");
      return;
    }
    if (bukti.size > 10 * 1024 * 1024 || (!bukti.type.startsWith("image/") && bukti.type !== "application/pdf") || /\.exe$/i.test(bukti.name)) {
      setMessage("Bukti harus berupa gambar atau PDF, maksimal 10 MB.");
      return;
    }
    setMessage("");
    startTransition(async () => {
      try {
        const result = await recordPayment({ student_id: student.id, bulan, tahun, jumlah: Number(data.get("jumlah")), tanggal_bayar: String(data.get("tanggal_bayar")), bukti, catatan: String(data.get("catatan") ?? "") });
        if (result.ok) {
          setSaved(true);
          setMessage("Pembayaran berhasil disimpan");
        } else setMessage(result.error);
      } catch {
        setMessage("Pembayaran gagal dikirim. Periksa koneksi dan coba lagi.");
      }
    });
  }

  return <>
    <button type="button" onClick={() => { setMessage(""); dialog.current?.showModal(); }} className="min-h-11 rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:opacity-90" aria-label={`Catat pembayaran ${student.nama}`}>Catat</button>
    <dialog ref={dialog} aria-labelledby={titleId} onCancel={(event) => { if (pending) event.preventDefault(); }} onClose={() => { if (saved) router.refresh(); }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 text-foreground shadow-2xl backdrop:bg-black/50">
      <h2 id={titleId} className="text-xl font-semibold">Catat pembayaran</h2>
      <p className="mt-2 break-words font-medium">{student.nama}</p>
      <p className="mt-1 text-muted-foreground">{period}</p>
      <form onSubmit={(event) => { event.preventDefault(); submit(new FormData(event.currentTarget)); }} className="mt-6 space-y-4">
        <fieldset disabled={pending || saved} className="space-y-4 disabled:opacity-60">
          <label className="block text-sm font-medium">Jumlah (RM)<input className={field} name="jumlah" type="number" min="0.01" step="0.01" required defaultValue={student.yuran_per_bulan} /></label>
          <label className="block text-sm font-medium">Tanggal bayar<input className={field} name="tanggal_bayar" type="date" required defaultValue={today} /></label>
          <label className="block text-sm font-medium">Bukti pembayaran<input className={`${field} text-sm`} name="bukti" type="file" accept="image/*,application/pdf" required aria-describedby={`${titleId}-hint`} /></label>
          <p id={`${titleId}-hint`} className="text-sm text-muted-foreground">Foto atau PDF, maksimal 10 MB.</p>
          <label className="block text-sm font-medium">Catatan (opsional)<textarea className={field} name="catatan" rows={3} /></label>
        </fieldset>
        {message && <p role={saved ? "status" : "alert"} className={`rounded-2xl p-3 text-sm ${saved ? "bg-emerald-100 text-emerald-900" : "bg-red-50 text-red-800"}`}>{message}</p>}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button type="button" onClick={close} disabled={pending} className="min-h-11 rounded-full border border-input px-4 py-2 disabled:opacity-60">{saved ? "Selesai" : "Batal"}</button>
          {!saved && <button disabled={pending} className="min-h-11 rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">{pending ? "Menyimpan…" : "Simpan"}</button>}
        </div>
      </form>
    </dialog>
  </>;
}
