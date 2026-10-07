import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-card px-6 text-center text-foreground">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Halaman tidak ditemukan.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-2xl bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-xs transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
