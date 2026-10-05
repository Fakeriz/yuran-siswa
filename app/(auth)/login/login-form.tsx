"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login, loginDemo } from "./actions";
import { Input } from "../../../components/motion-input";
import { StatefulButton } from "../../../components/motion-button";

export function LoginForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(login, {
    error: null,
    destination: null,
  });
  const [demoPending, startDemoTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [revealPassword, setRevealPassword] = useState(false);

  useEffect(() => {
    if (state.destination) router.push(state.destination);
  }, [state.destination, router]);

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
  const submitState = pending ? "loading" : state.error ? "error" : "idle";

  const demoRoles = [
    {
      role: "admin" as const,
      title: "Admin",
      desc: "Kelola & Persetujuan",
      cta: "Masuk Admin →",
      email: "admin@yuran.demo",
      password: "admin12345",
    },
    {
      role: "staff" as const,
      title: "Staff",
      desc: "Pilih Grup & Catat Bayar",
      cta: "Masuk Staff →",
      email: "staff@yuran.demo",
      password: "staff12345",
    },
    {
      role: "orang_tua" as const,
      title: "Orang Tua",
      desc: "Pantau Anak & Kwitansi",
      cta: "Masuk Ortu →",
      email: "ortu@yuran.demo",
      password: "ortu12345",
    },
  ];

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            Akses Demo Instan (1-Klik Masuk)
          </p>
          <span className="inline-block rounded-full bg-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
            Tersedia
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Pilih salah satu peran di bawah untuk langsung mencoba aplikasi tanpa perlu mengetik:
        </p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {demoRoles.map((d) => (
            <button key={d.role}
              type="button" disabled={isLoading}
              onClick={() => handleInstantDemo(d.role)}
              className="flex flex-col items-center justify-center rounded-xl border border-emerald-300 bg-card p-3 text-center shadow-xs transition hover:bg-emerald-100 active:scale-[0.98] disabled:opacity-60"
            >
              <span className="text-xs font-bold text-emerald-950">
                {d.title}
              </span>
              <span className="mt-0.5 text-[11px] text-muted-foreground">
                {d.desc}
              </span>
              <span className="mt-2 rounded-lg bg-emerald-800 px-2.5 py-1 text-[11px] font-medium text-white">
                {d.cta}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">
            Atau masuk manual dengan email
          </span>
        </div>
      </div>

      <form action={action} className="space-y-5" aria-busy={isLoading}>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Email
            </span>
            <div className="flex gap-1.5 text-xs text-muted-foreground">
              <button type="button" onClick={() => setDemo("admin@yuran.demo", "admin12345")}
                className="underline hover:text-primary"
              >
                Isi Admin
              </button>
              <span>·</span>
              <button type="button" onClick={() => setDemo("staff@yuran.demo", "staff12345")}
                className="underline hover:text-primary"
              >
                Isi Staff
              </button>
              <span>·</span>
              <button type="button" onClick={() => setDemo("ortu@yuran.demo", "ortu12345")}
                className="underline hover:text-primary"
              >
                Isi Ortu
              </button>
            </div>
          </div>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="admin@yuran.demo" leftIcon={<Mail />}
            disabled={isLoading}
            value={email}
            onChange={setEmail}
          />
        </div>

        <div>
          <Input id="password" name="password" label="Kata sandi" type={revealPassword ? "text" : "password"}
            autoComplete="current-password" required placeholder="••••••••" leftIcon={<Lock />}
            rightIcon={
              <button type="button" disabled={isLoading}
                onClick={() => setRevealPassword((prev) => !prev)}
                aria-label={
                  revealPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                className="text-muted-foreground outline-none transition-colors hover:text-muted-foreground focus-visible:text-muted-foreground"
              >
                {revealPassword ? <EyeOff /> : <Eye />}
              </button>
            }
            disabled={isLoading}
            value={password}
            onChange={setPassword}
          />
        </div>

        {state.error && (
          <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900"
          >
            {state.error}
          </p>
        )}

        <StatefulButton type="submit" size="lg" state={submitState}
          loadingText="Sedang memproses…" errorText="Coba lagi" disabled={isLoading}
          className="w-full"
        >
          Masuk dengan Email
        </StatefulButton>
      </form>
    </div>
  );
}
