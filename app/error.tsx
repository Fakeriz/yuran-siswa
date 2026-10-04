"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <h1 className="text-2xl font-bold tracking-tight">Terjadi kesalahan</h1>
      <p className="mt-3 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        Layanan sedang mengalami kendala. Silakan coba muat ulang halaman.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 min-h-11 rounded-2xl bg-emerald-800 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
      >
        Coba lagi
      </button>
    </main>
  );
}
