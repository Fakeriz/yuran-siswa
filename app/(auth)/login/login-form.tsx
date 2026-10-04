"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login, loginDemo } from "./actions";

export function LoginForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(login, { error: null, destination: null });
  const [demoPending, startDemoTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (state.destination) router.push(state.destination);
  }, [state.destination, router]);
  const inputClass = "mt-2 min-h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  const handleInstantDemo = (role: "admin" | "staff" | "orang_tua") => {
    startDemoTransition(async () => {
      const destination = await loginDemo(role);
      router.push(destination);
    });
  };

  const setDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  const isLoading = pending || demoPending;

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 dark:border-emerald-800 dark:bg-emerald-950/40">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
            Akses Demo Instan (1-Klik Masuk)
          </p>
          <span className="inline-block rounded-full bg-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            Tersedia
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Pilih salah satu peran di bawah untuk langsung mencoba aplikasi tanpa perlu mengetik:
        </p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleInstantDemo("admin")}
            className="flex flex-col items-center justify-center rounded-xl border border-emerald-300 bg-white p-3 text-center shadow-xs transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 disabled:opacity-60"
          >
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-300">Admin</span>
            <span className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">Kelola & Persetujuan</span>
            <span className="mt-2 rounded-lg bg-emerald-800 px-2.5 py-1 text-[11px] font-medium text-white dark:bg-emerald-700">
              Masuk Admin &rarr;
            </span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleInstantDemo("staff")}
            className="flex flex-col items-center justify-center rounded-xl border border-emerald-300 bg-white p-3 text-center shadow-xs transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 disabled:opacity-60"
          >
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-300">Staff</span>
            <span className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">Pilih Grup & Catat Bayar</span>
            <span className="mt-2 rounded-lg bg-emerald-800 px-2.5 py-1 text-[11px] font-medium text-white dark:bg-emerald-700">
              Masuk Staff &rarr;
            </span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleInstantDemo("orang_tua")}
            className="flex flex-col items-center justify-center rounded-xl border border-emerald-300 bg-white p-3 text-center shadow-xs transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 disabled:opacity-60"
          >
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-300">Orang Tua</span>
            <span className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">Pantau Anak & Kwitansi</span>
            <span className="mt-2 rounded-lg bg-emerald-800 px-2.5 py-1 text-[11px] font-medium text-white dark:bg-emerald-700">
              Masuk Ortu &rarr;
            </span>
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            Atau masuk manual dengan email
          </span>
        </div>
      </div>

      <form action={action} className="space-y-5" aria-busy={isLoading}>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <div className="flex gap-1.5 text-xs text-zinc-500">
              <button
                type="button"
                onClick={() => setDemo("admin@yuran.demo", "admin12345")}
                className="underline hover:text-emerald-800 dark:hover:text-emerald-400"
              >
                Isi Admin
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setDemo("staff@yuran.demo", "staff12345")}
                className="underline hover:text-emerald-800 dark:hover:text-emerald-400"
              >
                Isi Staff
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setDemo("ortu@yuran.demo", "ortu12345")}
                className="underline hover:text-emerald-800 dark:hover:text-emerald-400"
              >
                Isi Ortu
              </button>
            </div>
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className={inputClass}
            placeholder="admin@yuran.demo"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium">Kata sandi</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className={inputClass}
            placeholder="••••••••"
          />
        </div>
        {state.error && <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200">{state.error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="min-h-12 w-full rounded-2xl bg-zinc-900 px-4 py-3 font-semibold text-white transition-colors duration-150 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60"
        >
          {isLoading ? "Sedang memproses…" : "Masuk dengan Email"}
        </button>
      </form>
    </div>
  );
}
