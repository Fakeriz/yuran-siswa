"use client";

// Halaman pemasaran YuranKu — bahasa visual minimal ala beUI:
// tanpa dekorasi, tipografi memimpin, satu aksen biru, CTA pil.
// Gerak secukupnya via CSS murni (reveal saat gulir).

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
    <div ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`lp-reveal${tampil ? " lp-reveal-tampil" : ""} ${className}`}
    >
      {children}
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
    <div className="relative min-h-dvh bg-background text-foreground">
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

      {/* Navigasi bersih */}
      <header className="lp-enter sticky top-0 z-40 border-b border-border bg-background" style={{ animationDelay: "0ms" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ReceiptText className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              YuranKu
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex" aria-label="Navigasi utama">
            {NAV.map((n) => (
              <a key={n.href}
                href={n.href}
                className="rounded-md transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/login" className="rounded-md text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Masuk
            </Link>
            <Link href="/daftar" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
          <div className="lp-backdrop absolute inset-0 bg-black/40" onClick={() => setMenuBuka(false)} />
          <div className="lp-drawer absolute top-0 left-0 flex h-full w-72 flex-col border-r border-border bg-background p-5">
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
                  className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 border-t border-border pt-5">
              <Link href="/daftar" className="rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Daftar
              </Link>
              <Link href="/login" className="rounded-full px-4 py-3 text-center text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      )}

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
          <h1 className="lp-enter mx-auto max-w-4xl text-5xl font-semibold tracking-tighter text-foreground sm:text-6xl lg:text-7xl" style={{ animationDelay: "80ms" }}
          >
            Yuran bulanan siswa, tercatat rapi setiap bulan.
          </h1>

          <p className="lp-enter mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: "160ms" }}
          >
            Staf mencatat pembayaran, orang tua memantau status dan mengunggah bukti, admin menerbitkan kwitansi. Semua dalam satu portal.
          </p>

          <div className="lp-enter mt-8 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "240ms" }}>
            <Link href="/login" className="rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Masuk
            </Link>
            <Link href="/daftar" className="rounded-full px-8 py-3.5 text-base font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Daftar
            </Link>
          </div>

          <div className="lp-enter mx-auto mt-16 max-w-4xl text-left" style={{ animationDelay: "320ms" }}>
            <DashboardMock />
          </div>
        </section>

        {/* Fitur */}
        <section id="fitur" className="mx-auto max-w-6xl scroll-mt-24 border-t border-border px-5 py-20 sm:py-28">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Dibuat untuk cara kerja sekolah yang sebenarnya.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              Setiap fitur menjawab satu kebutuhan nyata: staf yang butuh kepastian, orang tua yang butuh kejelasan, dan admin yang butuh arsip yang bisa dipertanggungjawabkan.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {FITUR.map((f, i) => (
              <Reveal key={f.judul} delay={i * 90}>
                <div className="h-full rounded-3xl border border-border bg-card p-7">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <f.ikon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{f.judul}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.teks}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Peran */}
        <section id="peran" className="mx-auto max-w-6xl scroll-mt-24 border-t border-border px-5 py-20 sm:py-28">
          <Reveal>
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Satu portal, tiga cara pakai.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Setiap peran masuk ke tampilan yang sesuai tugasnya.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-10 flex justify-center">
              <div className="inline-flex rounded-full border border-border bg-card p-1.5" role="tablist" aria-label="Pilih peran">
                {PERAN.map((p) => (
                  <button key={p.id}
                    type="button" role="tab" aria-selected={peranAktif === p.id}
                    onClick={() => setPeranAktif(p.id)}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      peranAktif === p.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <p.ikon className="size-4" aria-hidden="true" />
                    {p.nama}
                  </button>
                ))}
              </div>
            </div>
            <div role="tabpanel" className="mx-auto mt-8 max-w-2xl rounded-3xl border border-border bg-card p-8 text-left">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <peran.ikon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-semibold text-foreground">
                  Portal {peran.nama}
                </h3>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">{peran.teks}</p>
              {peran.aksi}
            </div>
          </Reveal>
        </section>

        {/* Demo */}
        <section id="demo" className="mx-auto max-w-6xl scroll-mt-24 border-t border-border px-5 py-20 sm:py-28">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Jelajahi tanpa mendaftar.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Pilih salah satu peran di bawah untuk langsung masuk ke dashboard masing-masing.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl">
              <DemoButtons variant="landing" />
            </div>
          </Reveal>
        </section>

        {/* CTA penutup */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-5 py-20 text-center sm:py-28">
            <Reveal>
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Siap merapikan pencatatan yuran sekolah?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Daftarkan akun orang tua dan hubungkan dengan data anak, atau masuk untuk mulai mencatat pembayaran hari ini juga.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/daftar" className="rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Daftar
                </Link>
                <Link href="/login" className="rounded-full px-8 py-3.5 text-base font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Masuk
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <span className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ReceiptText className="size-4" aria-hidden="true" />
            </span>
            <span className="font-bold tracking-tight text-foreground">YuranKu</span>
          </span>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground" aria-label="Navigasi footer">
            <Link href="/login" className="rounded-md transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Masuk</Link>
            <Link href="/daftar" className="rounded-md transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Daftar</Link>
            <a href="#demo" className="rounded-md transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Demo</a>
          </nav>
          <p className="text-xs text-muted-foreground">
            Sistem pencatatan yuran bulanan siswa
          </p>
        </div>
      </footer>
    </div>
  );
}
