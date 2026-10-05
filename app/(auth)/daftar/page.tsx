import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { getProfile, myStudentIds } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { RegisterForm } from "./register-form";
import { GlowBackground } from "../../../components/glow-background";

export const metadata = { title: "Daftar orang tua | YuranKu" };

export default async function RegisterPage() {
  let students: { id: string; nama: string; kelas: string }[] = [];
  let unavailable = false;
  let existingMessage = "";
  try {
    const profile = await getProfile();
    if (profile) {
      existingMessage = profile.peran === "orang_tua"
        ? (await myStudentIds()).length ? "Akun Anda sudah memiliki anak yang disetujui." : "menunggu persetujuan"
        : "Anda sudah masuk. Pendaftaran ini khusus akun orang tua baru.";
    } else {
      const db = await createClient();
      const { data, error } = await db.rpc("registration_students");
      if (error) unavailable = true;
      else students = data ?? [];
    }
  } catch { unavailable = true; }
  return <main className="relative min-h-dvh bg-[#f7f9fc] px-6 py-12 text-slate-900 dark:bg-[#0b1329] dark:text-slate-100">
    <GlowBackground />
    <div className="relative mx-auto max-w-lg">
      <Link
        href="/"
        className="flex w-fit items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        aria-label="Kembali ke halaman utama"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white">
          <ReceiptText className="size-4.5" aria-hidden="true" />
        </span>
        <span className="text-xl font-bold tracking-tight">YuranKu</span>
      </Link>

      <div className="mt-8 rounded-3xl border border-white bg-white/70 p-6 shadow-[0_24px_60px_-20px_rgba(37,99,235,0.3)] backdrop-blur-xl sm:p-8 dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-[0_24px_60px_-20px_rgba(37,99,235,0.2)]">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Daftar sebagai orang tua</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Pilih anak Anda. Data pembayaran tersedia setelah pengajuan disetujui.</p>
        <div className="mt-6">
          {existingMessage ? <p role="status" className="rounded-2xl border border-slate-300 p-5 dark:border-slate-700">{existingMessage}</p>
            : unavailable ? <p role="alert">Daftar siswa belum dapat dimuat. Silakan coba lagi nanti.</p>
            : <RegisterForm students={students} />}
        </div>
      </div>

      <Link href="/login" className="mt-6 block rounded-lg py-2 text-center text-sm font-medium text-blue-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-blue-300">Sudah punya akun? Masuk</Link>
    </div>
  </main>;
}
