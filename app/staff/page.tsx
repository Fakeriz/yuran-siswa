import type { Metadata } from "next";
import Link from "next/link";
import { myGroups } from "../../lib/auth";
import { paymentStatusFor, unpaidStudents } from "../../lib/fees";
import { createClient } from "../../lib/supabase/server";
import type { Payment, Student } from "../../lib/types";
import { PaymentForm } from "./payment-form";
import { REAL_STUDENTS, REAL_PAYMENTS } from "../../lib/data/real-data";
import { UserBar } from "../../components/user-bar";
import { FinanceHero } from "../../components/finance-hero";
import { FinanceKpi } from "../../components/finance-kpi";
import { CheckCircle2, AlertCircle, Users, UsersRound, LayoutDashboard } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard staf | YuranKu" };
const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const field = "min-h-11 rounded-2xl border border-input bg-card px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

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
      const realList: Student[] = REAL_STUDENTS.map((s) => ({
        id: s.id, nama: s.nama, grup: s.grup, kelas: s.kelas,
        yuran_per_bulan: s.yuran_per_bulan, status: s.is_active ? "aktif" : "nonaktif",
      }));
      students = realList.filter((s) => groups.includes(s.grup));
    }
    if (students.length) {
      try {
        const db = await createClient();
        const result = await db.from("payments").select("*").in("student_id", students.map((student) => student.id))
          .eq("bulan", bulan).eq("tahun", tahun).returns<Payment[]>();
        if (!result.error && result.data && result.data.length > 0) {
          payments = result.data;
        } else {
          payments = REAL_PAYMENTS.filter((p) => p.bulan === bulan && p.tahun === tahun).map((p) => ({
            id: p.id, student_id: p.student_id, bulan: p.bulan, tahun: p.tahun, jumlah: p.jumlah,
            tanggal_bayar: p.tanggal_bayar || `${tahun}-${String(bulan).padStart(2, "0")}-01`,
            bukti_drive_file_id: "demo-file", kwitansi_drive_file_id: null, dicatat_oleh: null, catatan: p.catatan,
          }));
        }
      } catch {
        payments = REAL_PAYMENTS.filter((p) => p.bulan === bulan && p.tahun === tahun).map((p) => ({
          id: p.id, student_id: p.student_id, bulan: p.bulan, tahun: p.tahun, jumlah: p.jumlah,
          tanggal_bayar: p.tanggal_bayar || `${tahun}-${String(bulan).padStart(2, "0")}-01`,
          bukti_drive_file_id: "demo-file", kwitansi_drive_file_id: null, dicatat_oleh: null, catatan: p.catatan,
        }));
      }
    }
  }
  const unpaid = unpaidStudents(students, payments, bulan, tahun);
  const visible = filter === "belum" ? unpaid : filter === "sudah"
    ? students.filter((student) => paymentStatusFor(payments, student.id, bulan, tahun) === "sudah") : students;
  const period = `${months[bulan - 1]} ${tahun}`;

  return (
    <div className="relative min-h-dvh flex flex-col bg-background text-foreground [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-primary">
      <UserBar userRole="staff" userName="Staff Demo" title="YuranKu · Dashboard Staf" />
      <div className="relative flex-1 md:grid md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-border p-6 md:min-h-dvh md:border-r md:border-b-0">
          <p className="px-3 text-xs font-medium text-muted-foreground">Menu</p>
          <nav aria-label="Menu staf" className="mt-2 space-y-0.5">
            <Link href="/staff" aria-current="page" className="flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary">
              <LayoutDashboard className="size-[18px] shrink-0 text-primary" aria-hidden />
              Dashboard Staf
            </Link>
            <Link href="/staff/grup" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <UsersRound className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
              Pilih Grup
            </Link>
          </nav>
        </aside>
      <main className="mx-auto w-full max-w-6xl min-w-0 px-4 py-8 sm:px-8 md:py-12">
        <FinanceHero name="Staf" subtitle={`Kelola dan catat pembayaran yuran siswa dalam grup Anda — ${period}.`}
          kpiGridClassName="lg:grid-cols-3" actions={
            <Link href="/staff/grup" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold text-primary transition hover:bg-muted"
            >
              <UsersRound className="size-4" aria-hidden />
              Pilih Grup
            </Link>
          }
        >
          <FinanceKpi icon={CheckCircle2}
            tone="green" value={String(students.length - unpaid.length)}
            label="Siswa sudah bayar"
          />
          <FinanceKpi icon={AlertCircle}
            tone="pink" value={String(unpaid.length)}
            label="Siswa belum bayar"
          />
          <FinanceKpi icon={Users}
            tone="blue" value={String(students.length)}
            label="Total siswa aktif"
          />
        </FinanceHero>
        <form key={`${bulan}-${tahun}`} className="mt-8 flex flex-wrap items-end gap-3" action="/staff">
          <label className="grid gap-2 text-sm font-medium">Bulan
            <select name="bulan" defaultValue={bulan} className={field}>{months.map((month, index) => <option value={index + 1} key={month}>{month}</option>)}</select>
          </label>
          <label className="grid gap-2 text-sm font-medium">Tahun
            <input name="tahun" type="number" min="2000" max="2100" required defaultValue={tahun} className={`${field} w-28`} />
          </label>
          <input type="hidden" name="filter" value={filter} />
          <button className="min-h-11 rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground transition hover:opacity-90">Tampilkan</button>
        </form>

        <section className="mt-10" aria-labelledby="student-list">
          <h2 id="student-list" className="text-xl font-semibold">Daftar siswa · {period}</h2>
          <form aria-label="Filter pembayaran" className="my-5 flex flex-wrap gap-2" action="/staff" method="GET">
            <input type="hidden" name="bulan" value={bulan} />
            <input type="hidden" name="tahun" value={tahun} />
            {([['semua', 'Semua'], ['sudah', 'Sudah bayar'], ['belum', 'Belum bayar']] as const).map(([value, label]) => (
              <button key={value} type="submit" name="filter" value={value} aria-current={filter === value ? "page" : undefined}
                className={`rounded-full px-4 py-3 text-sm font-medium transition duration-150 ${filter === value ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-muted"}`}>{label}</button>
            ))}
          </form>
          {!visible.length ? <p className="rounded-2xl border border-border p-6 text-muted-foreground">{!groups.length ? "Anda belum memiliki grup. Buka Pilih grup untuk memilih siswa Anda." : !students.length ? "Belum ada siswa aktif dalam grup Anda." : "Tidak ada siswa untuk filter ini."}</p> : (
            <div className="overflow-x-auto rounded-3xl border border-border/70 bg-card shadow-sm">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Status yuran siswa untuk {period}</caption>
                <thead className="bg-muted/80 text-muted-foreground"><tr>{["Siswa", "Kelas / grup", "Status", "Pembayaran"].map((label) => <th scope="col" key={label} className="px-4 py-4 font-medium">{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-border">{visible.map((student) => {
                  const paid = paymentStatusFor(payments, student.id, bulan, tahun) === "sudah";
                  return <tr key={student.id}>
                    <th scope="row" className="max-w-64 break-words px-4 py-5 font-medium">{student.nama}</th>
                    <td className="px-4 py-5">{student.kelas}<span className="block text-muted-foreground">{student.grup}</span></td>
                    <td className="px-4 py-5"><span className={`inline-block whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium ${paid ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>{paid ? "Sudah bayar" : "Belum bayar"}</span></td>
                    <td className="px-4 py-5">{paid ? <span className="text-muted-foreground">Tercatat</span> : <PaymentForm key={`${student.id}-${bulan}-${tahun}`} student={student} bulan={bulan} tahun={tahun} period={period} today={today} />}</td>
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
