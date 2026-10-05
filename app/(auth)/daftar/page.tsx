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
  return <main className="relative min-h-dvh bg-background px-6 py-12 text-foreground">
    <GlowBackground />
    <div className="relative mx-auto max-w-lg">
      <Link href="/" className="flex w-fit items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" aria-label="Kembali ke halaman utama"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
          <ReceiptText className="size-4.5" aria-hidden="true" />
        </span>
        <span className="text-xl font-bold tracking-tight">YuranKu</span>
      </Link>

      <div className="mt-8 rounded-3xl border border-white bg-card/70 p-6 shadow-[0_24px_60px_-20px_rgba(37,99,235,0.3)] backdrop-blur-xl sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Daftar sebagai orang tua</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pilih anak Anda. Data pembayaran tersedia setelah pengajuan disetujui.</p>
        <div className="mt-6">
          {existingMessage ? <p role="status" className="rounded-2xl border border-input p-5">{existingMessage}</p>
            : unavailable ? <p role="alert">Daftar siswa belum dapat dimuat. Silakan coba lagi nanti.</p>
            : <RegisterForm students={students} />}
        </div>
      </div>

      <Link href="/login" className="mt-6 block rounded-lg py-2 text-center text-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Sudah punya akun? Masuk</Link>
    </div>
  </main>;
}
