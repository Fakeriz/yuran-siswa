import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        Halaman tidak ditemukan.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-2xl bg-emerald-800 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
