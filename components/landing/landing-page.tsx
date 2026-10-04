"use client";

// Halaman pemasaran Yuran Siswa dengan bahasa visual "financial dashboard glow":
// bidang sejuk #f7f9fc, gradien biru di sudut, panel kaca, halo biru,
// dan CTA gelap machined. Seluruh gerak dibuat dengan CSS murni
// (tanpa dependency animasi), mengikuti pola komponen lain di repo ini.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarCheck2,
  GraduationCap,
  HeartHandshake,
  Menu,
  ReceiptText,
  ShieldCheck,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { DashboardMock } from "./dashboard-mock";
import { DemoButtons, DemoRoleCardAction } from "../demo-buttons";

// Muncul saat digulir ke viewport. Sekali terlihat, tetap terlihat.
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTampil(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entri]) => {
        if (entri.isIntersecting) {
          setTampil(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`lp-reveal${tampil ? " lp-reveal-tampil" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// Latar glow: dicat sekali, dipakai seluruh halaman agar terasa satu keluarga.
function LatarGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Sapuan gradien atas ala sumber: from-blue-50 via-blue-100 */}
      <div className="absolute top-0 left-0 h-[560px] w-full bg-gradient-to-b from-blue-50 via-blue-100/70 to-transparent dark:from-blue-950/50 dark:via-blue-950/20 dark:to-transparent" />
      {/* Gumpalan sudut */}
      <div className="absolute -top-32 -left-32 size-[480px] rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-800/20" />
      <div className="absolute top-24 -right-40 size-[560px] rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-900/20" />
      {/* Pola ikon samar: tekstur identitas produk, bukan dekorasi acak */}
      <div className="absolute inset-0 text-blue-700 opacity-[0.05] dark:text-blue-300 dark:opacity-[0.06]">
        <ReceiptText className="absolute top-[12%] left-[6%] size-16 -rotate-12" />
        <CalendarCheck2 className="absolute top-[30%] right-[8%] size-20 rotate-12" />
        <Users className="absolute top-[58%] left-[10%] size-14 rotate-6" />
        <BadgeCheck className="absolute top-[76%] right-[12%] size-16 -rotate-6" />
        <UploadCloud className="absolute top-[8%] right-[28%] size-12 rotate-12" />
      </div>
    </div>
  );
}

const NAV = [
  { label: "Fitur", href: "#fitur" },
  { label: "Peran", href: "#peran" },
  { label: "Demo", href: "#demo" },
];

const FITUR = [
  {
    ikon: CalendarCheck2,
    judul: "Status bayar per bulan, sekilas terbaca",
    teks: "Setiap siswa punya penanda Sudah atau Belum untuk tiap bulan. Tunggakan tidak lagi mengandalkan ingatan atau catatan kertas yang tercecer.",
  },
  {
    ikon: UploadCloud,
    judul: "Bukti bayar tersimpan di arsip digital",
    teks: "Foto atau pindaian bukti pembayaran diunggah dan terhubung langsung ke catatan pembayaran, sehingga verifikasi tidak perlu mencari-cari berkas.",
  },
  {
    ikon: BadgeCheck,
    judul: "Kwitansi resmi diterbitkan admin",
    teks: "Setelah pembayaran disahkan, admin menerbitkan kwitansi yang bisa diunduh orang tua kapan saja sebagai bukti yang sah.",
  },
];

const PERAN = [
  {
    id: "admin",
    ikon: ShieldCheck,
    nama: "Admin",
    teks: "Setujui pendaftaran orang tua, kelola data siswa dan akun pengguna, serta terbitkan kwitansi resmi untuk setiap pembayaran yang disahkan.",
    aksi: <DemoRoleCardAction role="admin" label="Coba Panel Admin" />,
  },
  {
    id: "staff",
    ikon: GraduationCap,
    nama: "Staff",
    teks: "Pilih grup kelas yang diampu, lihat siapa yang belum membayar bulan berjalan, dan catat pembayaran langsung dari kelas.",
    aksi: <DemoRoleCardAction role="staff" label="Coba Dashboard Staf" />,
  },
  {
    id: "orang_tua",
    ikon: HeartHandshake,
    nama: "Orang Tua",
    teks: "Pantau status yuran setiap anak per bulan, unggah bukti pembayaran, dan unduh kwitansi resmi yang sudah diterbitkan sekolah.",
    aksi: <DemoRoleCardAction role="orang_tua" label="Coba Portal Orang Tua" />,
  },
];

export function LandingPage() {
  const [menuBuka, setMenuBuka] = useState(false);
  const [peranAktif, setPeranAktif] = useState(PERAN[0].id);

  useEffect(() => {
    if (!menuBuka) return;
    const tutup = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuBuka(false);
    };
    document.addEventListener("keydown", tutup);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tutup);
      document.body.style.overflow = "";
    };
  }, [menuBuka]);

  const peran = PERAN.find((p) => p.id === peranAktif) ?? PERAN[0];

  return (
    <div className="relative min-h-dvh bg-[#f7f9fc] text-[#1e293b] dark:bg-[#0b1329] dark:text-slate-200">
      <style>{`
        @keyframes lp-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-drawer-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes lp-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .lp-enter { opacity: 0; animation: lp-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .lp-reveal { opacity: 0; transform: translateY(26px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
        .lp-reveal-tampil { opacity: 1; transform: none; }
        .lp-drawer { animation: lp-drawer-in 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
        .lp-backdrop { animation: lp-fade-in 0.25s ease; }
        @media (prefers-reduced-motion: reduce) {
          .lp-enter, .lp-reveal, .lp-drawer, .lp-backdrop { animation: none !important; transition: none !important; }
          .lp-enter, .lp-reveal { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <LatarGlow />

      {/* Navigasi kaca mengambang */}
      <header className="lp-enter sticky top-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-6xl" style={{ animationDelay: "0ms" }}>
        <div className="flex items-center justify-between rounded-2xl border border-white bg-white/80 p-2 pl-5 shadow-sm backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80">
          <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ReceiptText className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Yuran Siswa
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex dark:text-slate-400" aria-label="Navigasi utama">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-md transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:hover:text-blue-400"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)] transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Daftar
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setMenuBuka(true)}
            aria-label="Buka menu navigasi"
            aria-expanded={menuBuka}
            className="flex size-11 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:hidden dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Laci navigasi mobile */}
      {menuBuka && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi">
          <div className="lp-backdrop absolute inset-0 bg-slate-950/40" onClick={() => setMenuBuka(false)} />
          <div className="lp-drawer absolute top-0 left-0 flex h-full w-72 flex-col border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0b1329]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <ReceiptText className="size-4.5" aria-hidden="true" />
                </span>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Yuran Siswa</span>
              </span>
              <button
                type="button"
                onClick={() => setMenuBuka(false)}
                aria-label="Tutup menu navigasi"
                className="flex size-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1" aria-label="Navigasi mobile">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuBuka(false)}
                  className="rounded-xl px-4 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t border-slate-200 pt-5 dark:border-slate-800">
              <Link
                href="/login"
                className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:text-slate-200"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-bold text-white shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-white dark:text-slate-900"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="relative">
        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-5 pt-16 pb-10 text-center sm:pt-24">
          <Link
            href="#demo"
            className="lp-enter mx-auto inline-flex w-fit items-center gap-2 rounded-full border-2 border-white bg-white px-1.5 py-1 pr-4 shadow-lg shadow-blue-500/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:shadow-blue-500/10"
            style={{ animationDelay: "80ms" }}
          >
            <span className="rounded-full bg-gradient-to-br from-blue-600 to-blue-300 px-2.5 py-0.5 text-xs font-bold tracking-wide text-white uppercase">
              Demo
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Jelajahi portal tanpa mendaftar, cukup satu klik
            </span>
          </Link>

          <h1
            className="lp-enter mx-auto mt-7 max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-slate-50"
            style={{ animationDelay: "160ms" }}
          >
            Yuran bulanan siswa, tercatat rapi setiap bulan.
          </h1>

          <p
            className="lp-enter mx-auto mt-6 max-w-2xl text-lg leading-relaxed font-medium text-slate-500 sm:text-xl dark:text-slate-400"
            style={{ animationDelay: "240ms" }}
          >
            Satu portal untuk staf mencatat pembayaran, orang tua memantau status
            dan mengunggah bukti, serta admin menerbitkan kwitansi. Semua
            tersimpan rapi dan mudah ditelusuri kembali.
          </p>

          <div className="lp-enter mt-9 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "320ms" }}>
            <Link
              href="/login"
              className="rounded-2xl bg-neutral-900 px-7 py-3.5 text-base font-bold text-white shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)] transition hover:-translate-y-0.5 hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Masuk ke Portal
            </Link>
            <Link
              href="/daftar"
              className="rounded-2xl border border-blue-200 bg-white/70 px-7 py-3.5 text-base font-semibold text-blue-700 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-950"
            >
              Daftar sebagai Orang Tua
            </Link>
          </div>

          <div className="lp-enter mx-auto mt-14 max-w-4xl text-left" style={{ animationDelay: "400ms" }}>
            <DashboardMock />
          </div>
        </section>

        {/* Fitur: tajuk menempel, baris bertingkat */}
        <section id="fitur" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <p className="text-sm font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
                  Fitur
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
                  Dibuat untuk cara kerja sekolah yang sebenarnya.
                </h2>
                <p className="mt-4 leading-relaxed text-slate-500 dark:text-slate-400">
                  Setiap fitur menjawab satu kebutuhan nyata: bendahara yang
                  butuh kepastian, orang tua yang butuh kejelasan, dan admin
                  yang butuh arsip yang bisa dipertanggungjawabkan.
                </p>
              </Reveal>
            </div>
            <div className="flex flex-col gap-5">
              {FITUR.map((f, i) => (
                <Reveal key={f.judul} delay={i * 90}>
                  <div className="flex gap-5 rounded-3xl border border-white bg-white/60 p-6 shadow-sm backdrop-blur transition hover:shadow-md sm:p-7 dark:border-slate-700/60 dark:bg-slate-900/60">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      <f.ikon className="size-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{f.judul}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">{f.teks}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Peran: tab interaktif */}
        <section id="peran" className="relative scroll-mt-24 border-y border-blue-100/70 bg-white/40 py-16 backdrop-blur-sm sm:py-24 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <Reveal>
              <p className="text-sm font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
                Peran
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
                Satu portal, tiga cara pakai.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-500 dark:text-slate-400">
                Setiap peran masuk ke tampilan yang sesuai tugasnya. Pilih
                peran untuk melihat apa yang bisa dilakukan.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-8 inline-flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900" role="tablist" aria-label="Pilih peran">
                {PERAN.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={peranAktif === p.id}
                    onClick={() => setPeranAktif(p.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-6 ${
                      peranAktif === p.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <p.ikon className="size-4" aria-hidden="true" />
                    {p.nama}
                  </button>
                ))}
              </div>
              <div role="tabpanel" className="mx-auto mt-6 max-w-2xl rounded-3xl border border-white bg-white/70 p-7 text-left shadow-sm backdrop-blur sm:p-8 dark:border-slate-700/60 dark:bg-slate-900/70">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <peran.ikon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Portal {peran.nama}
                  </h3>
                </div>
                <p className="mt-4 leading-relaxed text-slate-500 dark:text-slate-400">{peran.teks}</p>
                {peran.aksi}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Demo */}
        <section id="demo" className="relative mx-auto max-w-4xl scroll-mt-24 px-5 py-16 sm:py-24">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-white bg-white/60 p-7 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.25)] backdrop-blur-xl sm:p-10 dark:border-slate-700/60 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
                    Demo
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                    Jelajahi tanpa mendaftar.
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Semua peran aktif
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
                Pilih salah satu peran di bawah untuk langsung masuk ke
                dashboard masing-masing tanpa mengisi kata sandi.
              </p>
              <DemoButtons />
            </div>
          </Reveal>
        </section>

        {/* CTA penutup */}
        <section className="relative mx-auto max-w-6xl px-5 pb-20 sm:pb-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-neutral-900 px-7 py-14 text-center shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)] sm:px-12 sm:py-20 dark:bg-slate-900 dark:shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.6),inset_-2px_-2px_6px_1px_rgba(148,163,184,0.12)]">
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-blue-600/30 blur-3xl" />
              </div>
              <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Siap merapikan pencatatan yuran sekolah?
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
                Daftarkan akaun orang tua dan hubungkan dengan data anak, atau
                masuk untuk mulai mencatat pembayaran hari ini juga.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/daftar"
                  className="rounded-2xl bg-white px-7 py-3.5 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Daftar sebagai Orang Tua
                </Link>
                <Link
                  href="/login"
                  className="rounded-2xl border border-white/25 px-7 py-3.5 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Masuk ke Portal
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer ringkas: hanya tautan yang benar-benar ada */}
      <footer className="relative border-t border-slate-200/70 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <span className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ReceiptText className="size-4" aria-hidden="true" />
            </span>
            <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">Yuran Siswa</span>
          </span>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400" aria-label="Navigasi footer">
            <Link href="/login" className="rounded-md transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:hover:text-blue-400">Masuk</Link>
            <Link href="/daftar" className="rounded-md transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:hover:text-blue-400">Daftar</Link>
            <a href="#demo" className="rounded-md transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:hover:text-blue-400">Demo</a>
          </nav>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Sistem pencatatan yuran bulanan siswa
          </p>
        </div>
      </footer>
    </div>
  );
}
