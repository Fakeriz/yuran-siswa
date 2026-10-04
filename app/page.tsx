import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "../lib/auth";
import { DemoButtons, DemoRoleCardAction } from "../components/demo-buttons";

export default async function Home() {
  let profile = null;
  try {
    profile = await getProfile();
  } catch {
    // If session check fails or is unconfigured, proceed to landing page
  }

  if (profile?.peran === "admin") {
    redirect("/admin");
  } else if (profile?.peran === "staff") {
    redirect("/staff");
  } else if (profile?.peran === "orang_tua") {
    redirect("/orangtua");
  }

  return (
    <main className="min-h-dvh bg-white px-6 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <p className="text-xl font-bold tracking-tight">Yuran Siswa</p>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Daftar
            </Link>
          </div>
        </header>

        <section className="py-16 text-center sm:py-24">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Pencatatan Yuran Bulanan Siswa
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Sistem transparan untuk pencatatan dan pemantauan yuran sekolah.
            Dirancang untuk kemudahan orang tua, staf pengajar, dan tim administrasi.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="rounded-2xl bg-emerald-800 px-6 py-3.5 text-base font-medium text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
            >
              Masuk ke Portal
            </Link>
            <Link
              href="/daftar"
              className="rounded-2xl border border-zinc-300 px-6 py-3.5 text-base font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-500"
            >
              Pendaftaran Orang Tua Baru
            </Link>
          </div>

          <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-emerald-300 bg-emerald-50/70 p-6 text-left dark:border-emerald-800/80 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Akun Demo Siap Pakai (1-Klik Masuk)
              </p>
              <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                Semua Peran Aktif
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              Klik tombol peran untuk langsung masuk ke masing-masing dashboard tanpa perlu mengisi kata sandi:
            </p>
            <DemoButtons />
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col justify-between rounded-3xl border border-zinc-200 p-6 shadow-sm dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold">Orang Tua</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Pantau status pembayaran per bulan, unggah bukti bayar, dan akses kwitansi resmi yang telah diterbitkan sekolah.
              </p>
            </div>
            <DemoRoleCardAction role="orang_tua" label="Coba Portal Orang Tua" />
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-zinc-200 p-6 shadow-sm dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold">Staff Pengajar</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Pilih grup anak didik, periksa rekapitulasi tunggakan bulanan, dan catat pembayaran langsung dari kelas.
              </p>
            </div>
            <DemoRoleCardAction role="staff" label="Coba Dashboard Staf" />
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-zinc-200 p-6 shadow-sm dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold">Administrasi</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Setujui hubungan anak dan orang tua, kelola akun pengguna, master data siswa, serta unggah arsip kwitansi.
              </p>
            </div>
            <DemoRoleCardAction role="admin" label="Coba Panel Admin" />
          </div>
        </section>
      </div>
    </main>
  );
}

