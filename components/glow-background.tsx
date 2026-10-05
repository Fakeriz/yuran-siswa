"use client";

// Latar glow sepunya untuk seluruh aplikasi: sapuan biru lembut dari atas
// dan gumpalan cahaya di sudut, dalam dua mode.
// Varian "app": halus untuk dasbor (keterbacaan data tetap utama).
// Varian "full": tegas untuk permukaan pemasaran.

export function GlowBackground({ variant = "app" }: { variant?: "app" | "full" }) {
  const full = variant === "full";
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className={`absolute top-0 left-0 w-full bg-gradient-to-b from-blue-50 via-blue-100/70 to-transparent dark:from-blue-950/40 dark:via-blue-950/20 dark:to-transparent ${
          full ? "h-[560px]" : "h-[320px] opacity-70"
        }`}
      />
      <div
        className={`absolute -top-32 -left-32 rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-800/20 ${
          full ? "size-[480px]" : "size-[320px] opacity-60"
        }`}
      />
      <div
        className={`absolute top-24 -right-40 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-800/15 ${
          full ? "size-[560px]" : "size-[360px] opacity-60"
        }`}
      />
    </div>
  );
}
