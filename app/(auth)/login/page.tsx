import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk | Yuran Siswa" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <p className="font-semibold">Yuran Siswa</p>
      <h1 className="mt-6 text-3xl font-semibold">Masuk ke akun Anda</h1>
      <LoginForm />
    </main>
  );
}
