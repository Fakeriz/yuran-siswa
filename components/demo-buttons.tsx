"use client";

import { useTransition } from "react";
import { loginDemo } from "../app/(auth)/login/actions";
import type { Role } from "../lib/types";

export function DemoButtons() {
  const [isPending, startTransition] = useTransition();

  const handleLogin = (role: Role) => {
    startTransition(async () => {
      await loginDemo(role);
    });
  };

  return (
    <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
      <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
        <div>
          <span className="font-semibold text-emerald-950 dark:text-emerald-300">Admin</span>
          <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">admin@yuran.demo</p>
          <p className="font-mono text-xs text-zinc-400">admin12345</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleLogin("admin")}
          className="mt-3 w-full rounded-xl bg-emerald-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"
        >
          {isPending ? "Memproses…" : "Masuk Admin →"}
        </button>
      </div>

      <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
        <div>
          <span className="font-semibold text-emerald-950 dark:text-emerald-300">Staff</span>
          <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">staff@yuran.demo</p>
          <p className="font-mono text-xs text-zinc-400">staff12345</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleLogin("staff")}
          className="mt-3 w-full rounded-xl bg-emerald-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"
        >
          {isPending ? "Memproses…" : "Masuk Staff →"}
        </button>
      </div>

      <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
        <div>
          <span className="font-semibold text-emerald-950 dark:text-emerald-300">Orang Tua</span>
          <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">ortu@yuran.demo</p>
          <p className="font-mono text-xs text-zinc-400">ortu12345</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleLogin("orang_tua")}
          className="mt-3 w-full rounded-xl bg-emerald-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"
        >
          {isPending ? "Memproses…" : "Masuk Ortu →"}
        </button>
      </div>
    </div>
  );
}

export function DemoRoleCardAction({ role, label }: { role: Role; label: string }) {
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
      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 underline underline-offset-4 dark:text-emerald-400 hover:text-emerald-900 disabled:opacity-60"
    >
      {isPending ? "Memproses..." : `${label} →`}
    </button>
  );
}
