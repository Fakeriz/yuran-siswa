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
    <main className="flex min-h-dvh flex-col items-center justify-center bg-card px-6 text-center text-foreground">
      <h1 className="text-2xl font-bold tracking-tight">Terjadi kesalahan</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Layanan sedang mengalami kendala. Silakan coba muat ulang halaman.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 min-h-11 rounded-2xl bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-xs transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Coba lagi
      </button>
    </main>
  );
}
