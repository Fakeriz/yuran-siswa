import type { Metadata } from "next";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { LoginForm } from "./login-form";
import { GlowBackground } from "../../../components/glow-background";

export const metadata: Metadata = { title: "Masuk | YuranKu" };

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh bg-[#f7f9fc] text-slate-900 dark:bg-[#0b1329] dark:text-slate-100">
      <GlowBackground />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Masuk ke akun Anda</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Selamat datang kembali. Masuk untuk mengurus yuran.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        <Link
          href="/daftar"
          className="mt-6 rounded-lg py-2 text-center text-sm font-medium text-blue-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-blue-300"
        >
          Belum punya akun? Daftar sebagai orang tua
        </Link>
      </div>
    </main>
  );
}
