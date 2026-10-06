import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-card px-6 text-center text-zinc-900">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-3 text-lg text-zinc-600">
        Halaman tidak ditemukan.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 px-5 py-2.5 font-medium text-white shadow-sm shadow-emerald-950/30 transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
