"use client";

import { useTransition } from "react";
import { loginDemo } from "../app/(auth)/login/actions";
import type { Role } from "../lib/types";

type DemoVariant = "default" | "landing";

export function DemoButtons({ variant = "default" }: { variant?: DemoVariant }) {
  const [isPending, startTransition] = useTransition();
  const cardClass = "border-border";
  const titleClass = "text-foreground";
  const detailClass = "text-muted-foreground";
  const passwordClass = "text-muted-foreground";
  const buttonClass = variant === "landing"
    ? "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    : "bg-primary text-primary-foreground hover:bg-primary/90";

  const handleLogin = (role: Role) => {
    startTransition(async () => {
      await loginDemo(role);
    });
  };

  return (
    <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
      <div className={`flex flex-col justify-between rounded-2xl border ${cardClass} bg-card p-3.5 shadow-xs`}>
        <div>
          <span className={`font-semibold ${titleClass}`}>Admin</span>
          <p className={`mt-1 font-mono text-xs ${detailClass}`}>admin@yuran.demo</p>
          <p className={`font-mono text-xs ${passwordClass}`}>admin12345</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleLogin("admin")}
          className={`mt-3 w-full rounded-xl px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${buttonClass}`}
        >
          {isPending ? "Memproses…" : "Masuk Admin"}
        </button>
      </div>

      <div className={`flex flex-col justify-between rounded-2xl border ${cardClass} bg-card p-3.5 shadow-xs`}>
        <div>
          <span className={`font-semibold ${titleClass}`}>Staf</span>
          <p className={`mt-1 font-mono text-xs ${detailClass}`}>staff@yuran.demo</p>
          <p className={`font-mono text-xs ${passwordClass}`}>staff12345</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleLogin("staff")}
          className={`mt-3 w-full rounded-xl px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${buttonClass}`}
        >
          {isPending ? "Memproses…" : "Masuk Staf"}
        </button>
      </div>

      <div className={`flex flex-col justify-between rounded-2xl border ${cardClass} bg-card p-3.5 shadow-xs`}>
        <div>
          <span className={`font-semibold ${titleClass}`}>Orang Tua</span>
          <p className={`mt-1 font-mono text-xs ${detailClass}`}>ortu@yuran.demo</p>
          <p className={`font-mono text-xs ${passwordClass}`}>ortu12345</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleLogin("orang_tua")}
          className={`mt-3 w-full rounded-xl px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${buttonClass}`}
        >
          {isPending ? "Memproses…" : "Masuk Orang Tua"}
        </button>
      </div>
    </div>
  );
}

export function DemoRoleCardAction({ role, label, variant = "default" }: { role: Role; label: string; variant?: DemoVariant }) {
  const [isPending, startTransition] = useTransition();

  const handleLogin = () => {
    startTransition(async () => {
      await loginDemo(role);
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleLogin}
      className={`mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold underline underline-offset-4 disabled:opacity-60 "text-primary hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"`}
    >
      {isPending ? "Memproses..." : `${label}`}
    </button>
  );
}
