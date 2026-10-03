import Link from "next/link";
import { getProfile, myStudentIds } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Daftar orang tua | Yuran Siswa" };

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
  return <main className="min-h-dvh bg-white px-6 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
    <div className="mx-auto max-w-lg">
      <p className="font-semibold">Yuran Siswa</p>
      <h1 className="mt-6 text-3xl font-semibold">Daftar sebagai orang tua</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">Pilih anak Anda. Data pembayaran tersedia setelah pengajuan disetujui.</p>
      {existingMessage ? <p role="status" className="mt-8 rounded-2xl border border-zinc-300 p-5 dark:border-zinc-700">{existingMessage}</p>
        : unavailable ? <p role="alert" className="mt-8">Daftar siswa belum dapat dimuat. Silakan coba lagi nanti.</p>
        : <RegisterForm students={students} />}
      <Link href="/login" className="mt-8 inline-block rounded-lg py-2 text-emerald-800 underline underline-offset-4 focus-visible:outline-2 dark:text-emerald-300">Sudah punya akun? Masuk</Link>
    </div>
  </main>;
}
