"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="min-h-dvh bg-card p-8 text-zinc-900">
    <h1 className="text-2xl font-semibold">Yuran anak belum dapat dimuat</h1>
    <p role="alert" className="mt-3">Periksa koneksi dan pastikan Anda masuk dengan akun orang tua.</p>
    <button onClick={reset} className="mt-6 min-h-12 rounded-full bg-primary px-5 py-2 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4">Coba lagi</button>
  </main>;
}
