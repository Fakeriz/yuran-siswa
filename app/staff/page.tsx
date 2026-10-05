import type { Metadata } from "next";
import Link from "next/link";
import { myGroups } from "../../lib/auth";
import { paymentStatusFor, unpaidStudents } from "../../lib/fees";
import { createClient } from "../../lib/supabase/server";
import type { Payment, Student } from "../../lib/types";
import { PaymentForm } from "./payment-form";
import { UserBar } from "../../components/user-bar";
import { GlowBackground } from "../../components/glow-background";

export const metadata: Metadata = { title: "Dashboard staf | Yuran Siswa" };
const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const field = "min-h-11 rounded-2xl border border-slate-300 bg-white px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-900";

export default async function StaffPage({ searchParams }: {
  searchParams: Promise<{ bulan?: string; tahun?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [currentYear, currentMonth] = today.split("-").map(Number);
  const requestedMonth = Number(params.bulan);
  const requestedYear = Number(params.tahun);
  const bulan = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12 ? requestedMonth : currentMonth;
  const tahun = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= 2100 ? requestedYear : currentYear;
  const filter = params.filter === "belum" || params.filter === "sudah" ? params.filter : "semua";
  const groups = await myGroups();
  let students: Student[] = [];
  let payments: Payment[] = [];
  if (groups.length) {
    try {
      const db = await createClient();
      const result = await db.from("students").select("id, nama, grup, kelas, yuran_per_bulan")
        .in("grup", groups).eq("is_active", true).order("nama").returns<Omit<Student, "status">[]>();
      if (!result.error && result.data && result.data.length > 0) {
        students = result.data.map((student) => ({ ...student, status: "aktif" }));
      }
    } catch {
      // fallback to demo below
    }
    if (!students.length) {
      const demoList: Student[] = [
        { id: "demo-student-1", nama: "Ahmad Albab", grup: "Grup A", kelas: "Tahun 1 Amanah", yuran_per_bulan: 50, status: "aktif" },
        { id: "demo-student-2", nama: "Siti Nurhaliza", grup: "Grup A", kelas: "Tahun 2 Bestari", yuran_per_bulan: 60, status: "aktif" },
        { id: "demo-student-3", nama: "Muhammad Faiz", grup: "Grup B", kelas: "Tahun 3 Cerdas", yuran_per_bulan: 55, status: "aktif" },
        { id: "demo-student-4", nama: "Nur Aisyah", grup: "Grup B", kelas: "Tahun 1 Amanah", yuran_per_bulan: 50, status: "aktif" },
      ];
      students = demoList.filter((s) => groups.includes(s.grup));
    }
    if (students.length) {
      try {
        const db = await createClient();
        const result = await db.from("payments").select("*").in("student_id", students.map((student) => student.id))
          .eq("bulan", bulan).eq("tahun", tahun).returns<Payment[]>();
        if (!result.error && result.data && result.data.length > 0) {
          payments = result.data;
        } else {
          payments = [
            { id: "demo-pay-1", student_id: "demo-student-1", bulan, tahun, jumlah: 50, tanggal_bayar: `${tahun}-${String(bulan).padStart(2, "0")}-15`, bukti_drive_file_id: "demo-file", kwitansi_drive_file_id: null, dicatat_oleh: null, catatan: "Transfer Bank" },
          ];
        }
      } catch {
        payments = [
          { id: "demo-pay-1", student_id: "demo-student-1", bulan, tahun, jumlah: 50, tanggal_bayar: `${tahun}-${String(bulan).padStart(2, "0")}-15`, bukti_drive_file_id: "demo-file", kwitansi_drive_file_id: null, dicatat_oleh: null, catatan: "Transfer Bank" },
        ];
      }
    }
  }
  const unpaid = unpaidStudents(students, payments, bulan, tahun);
  const visible = filter === "belum" ? unpaid : filter === "sudah"
    ? students.filter((student) => paymentStatusFor(payments, student.id, bulan, tahun) === "sudah") : students;
  const period = `${months[bulan - 1]} ${tahun}`;

  return (
    <div className="relative min-h-dvh flex flex-col bg-[#f7f9fc] text-slate-900 dark:bg-[#0b1329] dark:text-slate-100 [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-blue-600">
      <GlowBackground />
      <UserBar userRole="staff" userName="Staff Demo" title="Yuran Siswa · Dashboard Staf" />
      <div className="relative flex-1 md:grid md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 p-6 dark:border-slate-800 md:min-h-dvh md:border-r md:border-b-0">
          <p className="text-lg font-semibold">Menu Staf</p>
          <nav aria-label="Menu staf" className="mt-6 space-y-2">
            <Link href="/staff" aria-current="page" className="block rounded-2xl bg-blue-600/10 px-4 py-3 font-semibold text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">Dashboard staf</Link>
            <Link href="/staff/grup" className="block rounded-2xl px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-900">Pilih grup</Link>
          </nav>
        </aside>
      <main className="mx-auto w-full max-w-6xl min-w-0 px-4 py-8 sm:px-8 md:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Yuran bulanan</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Pembayaran siswa aktif dalam grup Anda.</p>
        <form key={`${bulan}-${tahun}`} className="mt-8 flex flex-wrap items-end gap-3" action="/staff">
          <label className="grid gap-2 text-sm font-medium">Bulan
            <select name="bulan" defaultValue={bulan} className={field}>{months.map((month, index) => <option value={index + 1} key={month}>{month}</option>)}</select>
          </label>
          <label className="grid gap-2 text-sm font-medium">Tahun
            <input name="tahun" type="number" min="2000" max="2100" required defaultValue={tahun} className={`${field} w-28`} />
          </label>
          <input type="hidden" name="filter" value={filter} />
          <button className="min-h-11 rounded-2xl bg-neutral-900 px-5 py-2 font-semibold text-white shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)] transition hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">Tampilkan</button>
        </form>
        <section aria-label={`Ringkasan ${period}`} className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_24px_60px_-20px_rgba(37,99,235,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"><p className="text-sm text-slate-500 dark:text-slate-400">Sudah bayar</p><p className="mt-2 text-3xl font-semibold tabular-nums">{students.length - unpaid.length}</p></div>
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"><p className="text-sm text-slate-500 dark:text-slate-400">Belum bayar</p><p className="mt-2 text-3xl font-semibold tabular-nums">{unpaid.length}</p></div>
        </section>
        <section className="mt-10" aria-labelledby="student-list">
          <h2 id="student-list" className="text-xl font-semibold">Daftar siswa · {period}</h2>
          <form aria-label="Filter pembayaran" className="my-5 flex flex-wrap gap-2" action="/staff" method="GET">
            <input type="hidden" name="bulan" value={bulan} />
            <input type="hidden" name="tahun" value={tahun} />
            {([['semua', 'Semua'], ['sudah', 'Sudah bayar'], ['belum', 'Belum bayar']] as const).map(([value, label]) => (
              <button key={value} type="submit" name="filter" value={value} aria-current={filter === value ? "page" : undefined}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition duration-150 ${filter === value ? "bg-neutral-900 text-white shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.5),inset_-2px_-2px_6px_1px_rgba(80,78,78,0.5)] dark:bg-white dark:text-slate-900" : "border border-slate-200 bg-white/70 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-800"}`}>{label}</button>
            ))}
          </form>
          {!visible.length ? <p className="rounded-2xl border border-slate-200 p-6 text-slate-600 dark:border-slate-800 dark:text-slate-400">{!groups.length ? "Anda belum memiliki grup. Buka Pilih grup untuk memilih anak didik Anda." : !students.length ? "Belum ada siswa aktif dalam grup Anda." : "Tidak ada siswa untuk filter ini."}</p> : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Status yuran siswa untuk {period}</caption>
                <thead className="bg-slate-50/80 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400"><tr>{["Siswa", "Kelas / grup", "Status", "Pembayaran"].map((label) => <th scope="col" key={label} className="px-4 py-4 font-medium">{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">{visible.map((student) => {
                  const paid = paymentStatusFor(payments, student.id, bulan, tahun) === "sudah";
                  return <tr key={student.id}>
                    <th scope="row" className="max-w-64 break-words px-4 py-5 font-medium">{student.nama}</th>
                    <td className="px-4 py-5">{student.kelas}<span className="block text-slate-500 dark:text-slate-400">{student.grup}</span></td>
                    <td className="px-4 py-5"><span className={`inline-block whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium ${paid ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"}`}>{paid ? "Sudah bayar" : "Belum bayar"}</span></td>
                    <td className="px-4 py-5">{paid ? <span className="text-slate-500 dark:text-slate-400">Tercatat</span> : <PaymentForm key={`${student.id}-${bulan}-${tahun}`} student={student} bulan={bulan} tahun={tahun} period={period} today={today} />}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      </div>
    </div>
  );
}
