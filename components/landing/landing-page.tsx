"use client";

// Halaman pemasaran YuranKu dengan bahasa visual "financial dashboard glow":
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
import styles from "./landing-theme.module.css";

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
    <div ref={ref}
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
      <div className="absolute top-0 left-0 h-[560px] w-full bg-gradient-to-b from-blue-50 via-blue-100/70 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent" />
      {/* Gumpalan sudut */}
      <div className="absolute -top-32 -left-32 size-[480px] rounded-full bg-blue-200/50 blur-3xl dark:bg-primary/10" />
      <div className="absolute top-24 -right-40 size-[560px] rounded-full bg-blue-100/70 blur-3xl dark:bg-primary/10" />
      {/* Pola ikon samar: tekstur identitas produk, bukan dekorasi acak */}
      <div className="absolute inset-0 text-primary opacity-[0.05] dark:opacity-[0.06]">
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
    aksi: <DemoRoleCardAction role="admin" label="Coba Portal Admin" variant="landing" />,
  },
  {
    id: "staff",
    ikon: GraduationCap,
    nama: "Staf",
    teks: "Pilih grup kelas yang diampu, lihat siapa yang belum membayar bulan berjalan, dan catat pembayaran langsung dari kelas.",
    aksi: <DemoRoleCardAction role="staff" label="Coba Portal Staf" variant="landing" />,
  },
  {
    id: "orang_tua",
    ikon: HeartHandshake,
    nama: "Orang Tua",
    teks: "Pantau status yuran setiap anak per bulan, unggah bukti pembayaran, dan unduh kwitansi resmi yang sudah diterbitkan sekolah.",
    aksi: <DemoRoleCardAction role="orang_tua" label="Coba Portal Orang Tua" variant="landing" />,
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
    <div className={`${styles.landing} relative min-h-dvh bg-background text-foreground`}>
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
        <div className="flex items-center justify-between rounded-2xl border border-white bg-card/80 p-2 pl-5 shadow-sm backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ReceiptText className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              YuranKu
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex" aria-label="Navigasi utama">
            {NAV.map((n) => (
              <a key={n.href}
                href={n.href}
                className="rounded-md transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Masuk
            </Link>
            <Link href="/daftar" className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)] transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Daftar
            </Link>
          </div>
          <button type="button" onClick={() => setMenuBuka(true)}
            aria-label="Buka menu navigasi" aria-expanded={menuBuka}
            className="flex size-11 items-center justify-center rounded-xl text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Laci navigasi mobile */}
      {menuBuka && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi">
          <div className="lp-backdrop absolute inset-0 bg-slate-950/40" onClick={() => setMenuBuka(false)} />
          <div className="lp-drawer absolute top-0 left-0 flex h-full w-72 flex-col border-r border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ReceiptText className="size-4.5" aria-hidden="true" />
                </span>
                <span className="text-lg font-bold tracking-tight text-foreground">YuranKu</span>
              </span>
              <button type="button" onClick={() => setMenuBuka(false)}
                aria-label="Tutup menu navigasi" className="flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1" aria-label="Navigasi mobile">
              {NAV.map((n) => (
                <a key={n.href}
                  href={n.href}
                  onClick={() => setMenuBuka(false)}
                  className="rounded-xl px-4 py-3.5 text-base font-semibold text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t border-border pt-5">
              <Link href="/login" className="rounded-xl border border-input px-4 py-3 text-center text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Masuk
              </Link>
              <Link href="/daftar" className="rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-bold text-white shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="relative">
        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-5 pt-12 pb-8 text-center sm:pt-14">
          <Link href="#demo" className="lp-enter mx-auto inline-flex w-fit items-center gap-2 rounded-full border-2 border-white bg-card px-1.5 py-1 pr-4 shadow-lg shadow-blue-500/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" style={{ animationDelay: "80ms" }}
          >
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold tracking-wide text-primary-foreground uppercase">
              Demo
            </span>
            <span className="text-sm font-medium text-foreground">
              Coba portal tanpa mendaftar
            </span>
          </Link>

          <h1 className="lp-enter mx-auto mt-5 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl" style={{ animationDelay: "160ms" }}
          >
            Yuran bulanan siswa, tercatat rapi setiap bulan.
          </h1>

          <p className="lp-enter mx-auto mt-4 max-w-2xl text-base leading-relaxed font-medium text-muted-foreground sm:text-lg" style={{ animationDelay: "240ms" }}
          >
            Staf mencatat pembayaran, orang tua memantau status dan mengunggah bukti, admin menerbitkan kwitansi. Semua dalam satu portal.
          </p>

          <div className="lp-enter mt-6 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "320ms" }}>
            <Link href="/login" className="rounded-2xl bg-neutral-900 px-7 py-3.5 text-base font-bold text-white shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)] transition hover:-translate-y-0.5 hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Masuk
            </Link>
            <Link href="/daftar" className="rounded-2xl border border-blue-200 bg-card/70 px-7 py-3.5 text-base font-semibold text-primary backdrop-blur transition hover:-translate-y-0.5 hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Daftar
            </Link>
          </div>

          <div className="lp-enter mx-auto mt-8 max-w-4xl text-left" style={{ animationDelay: "400ms" }}>
            <DashboardMock />
          </div>
        </section>

        {/* Fitur: tajuk menempel, baris bertingkat */}
        <section id="fitur" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Dibuat untuk cara kerja sekolah yang sebenarnya.
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Setiap fitur menjawab satu kebutuhan nyata: bendahara yang butuh kepastian, orang tua yang butuh kejelasan, dan admin yang butuh arsip yang bisa dipertanggungjawabkan.
                </p>
              </Reveal>
            </div>
            <div className="flex flex-col gap-5">
              {FITUR.map((f, i) => (
                <Reveal key={f.judul} delay={i * 90}>
                  <div className="flex gap-5 rounded-3xl border border-white bg-card/60 p-6 shadow-sm backdrop-blur transition hover:shadow-md sm:p-7">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <f.ikon className="size-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{f.judul}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.teks}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Peran: tab interaktif */}
        <section id="peran" className="relative scroll-mt-24 border-y border-blue-100/70 bg-card/40 py-16 backdrop-blur-sm sm:py-24 dark:border-border">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <Reveal>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Satu portal, tiga cara pakai.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Setiap peran masuk ke tampilan yang sesuai tugasnya. Pilih peran untuk melihat apa yang bisa dilakukan.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-8 inline-flex rounded-2xl border border-border bg-card p-1.5 shadow-sm" role="tablist" aria-label="Pilih peran">
                {PERAN.map((p) => (
                  <button key={p.id}
                    type="button" role="tab" aria-selected={peranAktif === p.id}
                    onClick={() => setPeranAktif(p.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-6 ${
                      peranAktif === p.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <p.ikon className="size-4" aria-hidden="true" />
                    {p.nama}
                  </button>
                ))}
              </div>
              <div role="tabpanel" className="mx-auto mt-6 max-w-2xl rounded-3xl border border-white bg-card/70 p-7 text-left shadow-sm backdrop-blur sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <peran.ikon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-bold text-foreground">
                    Portal {peran.nama}
                  </h3>
                </div>
                <p className="mt-4 leading-relaxed text-muted-foreground">{peran.teks}</p>
                {peran.aksi}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Demo */}
        <section id="demo" className="relative mx-auto max-w-4xl scroll-mt-24 px-5 py-16 sm:py-24">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-white bg-card/60 p-7 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.25)] backdrop-blur-xl sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Jelajahi tanpa mendaftar.
                  </h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  Semua peran aktif
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Pilih salah satu peran di bawah untuk langsung masuk ke dashboard masing-masing tanpa mengisi kata sandi.
              </p>
              <DemoButtons variant="landing" />
            </div>
          </Reveal>
        </section>

        {/* CTA penutup */}
        <section className="relative mx-auto max-w-6xl px-5 pb-20 sm:pb-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-neutral-900 px-7 py-14 text-center shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)] sm:px-12 sm:py-20">
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
              </div>
              <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Siap merapikan pencatatan yuran sekolah?
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
                Daftarkan akun orang tua dan hubungkan dengan data anak, atau masuk untuk mulai mencatat pembayaran hari ini juga.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/daftar" className="rounded-2xl bg-card px-7 py-3.5 text-base font-bold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Daftar
                </Link>
                <Link href="/login" className="rounded-2xl border border-white/25 px-7 py-3.5 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-card/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Masuk
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer ringkas: hanya tautan yang benar-benar ada */}
      <footer className="relative border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <span className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ReceiptText className="size-4" aria-hidden="true" />
            </span>
            <span className="font-bold tracking-tight text-foreground">YuranKu</span>
          </span>
          <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground" aria-label="Navigasi footer">
            <Link href="/login" className="rounded-md transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Masuk</Link>
            <Link href="/daftar" className="rounded-md transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Daftar</Link>
            <a href="#demo" className="rounded-md transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Demo</a>
          </nav>
          <p className="text-xs text-muted-foreground">
            Sistem pencatatan yuran bulanan siswa
          </p>
        </div>
      </footer>
    </div>
  );
}
