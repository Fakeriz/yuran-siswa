"use client";

import { useEffect } from "react";

export const runtime = "edge";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <main className="max-w-md">
          <h1 className="text-2xl font-bold tracking-tight">Terjadi kesalahan sistem</h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Aplikasi mengalami kendala teknis sementara. Silakan coba muat ulang halaman.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            Muat ulang
          </button>
        </main>
      </body>
    </html>
  );
}
