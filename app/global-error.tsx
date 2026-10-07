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
      <body className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center text-foreground antialiased">
        <main className="max-w-md">
          <h1 className="text-2xl font-bold tracking-tight">Terjadi kesalahan sistem</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Aplikasi mengalami kendala teknis sementara. Silakan coba muat ulang halaman.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition hover:opacity-90"
          >
            Muat ulang
          </button>
        </main>
      </body>
    </html>
  );
}
