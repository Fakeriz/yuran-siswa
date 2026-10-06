import type { Metadata } from "next";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk | YuranKu" };

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh bg-background text-foreground">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
        <Link href="/" className="flex w-fit items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" aria-label="Kembali ke halaman utama"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ReceiptText className="size-4.5" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight">YuranKu</span>
        </Link>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Masuk ke akun Anda</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Selamat datang kembali. Masuk untuk mengurus yuran.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        <Link href="/daftar" className="mt-6 rounded-lg py-2 text-center text-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Belum punya akun? Daftar sebagai orang tua
        </Link>
      </div>
    </main>
  );
}
