import { myStudentIds } from "../../lib/auth";
import { REAL_STUDENTS, REAL_PAYMENTS } from "../../lib/data/real-data";
import { getViewUrl } from "../../lib/drive";
import { paymentStatusFor } from "../../lib/fees";
import { createClient } from "../../lib/supabase/server";
import type { Payment, Student } from "../../lib/types";
import { PaymentForm } from "../staff/payment-form";
import { FinanceHero } from "../../components/finance-hero";
import { FinanceKpi } from "../../components/finance-kpi";
import { Users, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Yuran anak | YuranKu" };
const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const money = (amount: number) => `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function ParentPage() {
  const ids = await myStudentIds();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [tahun, currentMonth] = today.split("-").map(Number);
  let students: Student[] = [];
  let payments: Payment[] = [];
  if (ids.length) {
    try {
      const db = await createClient();
      const [studentResult, paymentResult] = await Promise.all([
        db.from("students").select("id, nama, grup, kelas, yuran_per_bulan, is_active").in("id", ids).order("nama"),
        db.from("payments").select("*").in("student_id", ids).eq("tahun", tahun).returns<Payment[]>(),
      ]);
      if (!studentResult.error && studentResult.data && studentResult.data.length > 0) {
        students = studentResult.data.map((student) => ({
          id: student.id, nama: student.nama, grup: student.grup, kelas: student.kelas,
          yuran_per_bulan: student.yuran_per_bulan, status: student.is_active ? "aktif" : "nonaktif",
        }));
        payments = paymentResult.data ?? [];
      }
    } catch {
      // fallback
    }
  }

  if (!students.length) {
    // Data asli: 2 siswa pertama sebagai contoh akun orang tua demo
    const realDemoIds = ["siswa-1", "siswa-2"];
    students = REAL_STUDENTS.filter((s) => realDemoIds.includes(s.id)).map((s) => ({
      id: s.id, nama: s.nama, grup: s.grup, kelas: s.kelas,
      yuran_per_bulan: s.yuran_per_bulan, status: s.is_active ? "aktif" : "nonaktif",
    }));
    payments = REAL_PAYMENTS.filter((p) => realDemoIds.includes(p.student_id) && p.tahun === tahun).map((p) => ({
      id: p.id, student_id: p.student_id, bulan: p.bulan, tahun: p.tahun, jumlah: p.jumlah,
      tanggal_bayar: p.tanggal_bayar || `${p.tahun}-${String(p.bulan).padStart(2, "0")}-01`,
      bukti_drive_file_id: "demo-file", kwitansi_drive_file_id: null, dicatat_oleh: null, catatan: p.catatan,
    }));
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 w-full min-w-0 max-w-full">
      <FinanceHero name="Orang Tua" subtitle={`Pantau status yuran anak Anda, riwayat pembayaran tahun ${tahun}.`}
          >
            <FinanceKpi icon={Users}
              tone="neutral" value={String(students.length)}
              label="Anak terdaftar"
            />
            <FinanceKpi icon={CheckCircle2}
              tone="success" value={String(students.filter((s) => paymentStatusFor(payments, s.id, currentMonth, tahun) === "sudah").length)}
              label={`Lunas bulan ${months[currentMonth - 1]}`}
            />
          </FinanceHero>
      {!ids.length ? <section className="mt-8 rounded-3xl border border-border/70 bg-card p-6" role="status">
        <h2 className="text-xl font-semibold">menunggu persetujuan</h2>
        <p className="mt-3 text-muted-foreground">Data anak akan tampil setelah pengajuan disetujui oleh admin atau staf.</p>
      </section> : !students.length ? <p role="status" className="mt-8 rounded-3xl border border-border/70 bg-card p-6">Data anak belum tersedia. Hubungi admin untuk memeriksa hubungan akun Anda.</p> : <div className="mt-8 space-y-5">
        {students.map((student, si) => <details key={student.id} className="rounded-3xl border border-border/70 bg-card shadow-sm" open={students.length === 1}>
          <summary className="cursor-pointer rounded-3xl p-5 sm:p-6">
            <span className="ml-2 break-words text-lg font-semibold">{student.nama}</span>
            <span className="mt-2 block text-sm text-muted-foreground">Kelas {student.kelas} · {money(student.yuran_per_bulan)} per bulan</span>
            <span className="mt-3 block text-sm">{months[currentMonth - 1]}: {paymentStatusFor(payments, student.id, currentMonth, tahun) === "sudah" ? "Sudah bayar" : "Belum bayar"}</span>
          </summary>
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <p className="mb-4 text-sm text-muted-foreground">Pilih bulan untuk melihat detail atau mencatat pembayaran.</p>
            <div className="grid grid-cols-1 items-start gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3">
              {months.map((month, index) => {
                const bulan = index + 1;
                const paid = paymentStatusFor(payments, student.id, bulan, tahun) === "sudah";
                const payment = payments.find((item) => item.student_id === student.id && item.bulan === bulan && item.tahun === tahun);
                return <details key={bulan} className="min-w-0 rounded-2xl border border-border/70 bg-card/60">
                  <summary className={`cursor-pointer rounded-2xl p-4 text-sm ${paid ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-destructive/10 text-destructive"}`}>
                    <span className="font-semibold">{month}</span><span className="mt-2 block">{paid ? "Sudah bayar" : "Belum bayar"}</span>
                  </summary>
                  <div className="space-y-3 break-words p-4 text-sm">
                    {payment ? <>
                      <dl className="space-y-2"><div><dt className="text-muted-foreground">Jumlah</dt><dd className="font-medium">{money(payment.jumlah)}</dd></div><div><dt className="text-muted-foreground">Tanggal bayar</dt><dd>{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" }).format(new Date(payment.tanggal_bayar))}</dd></div></dl>
                      {payment.catatan && <p className="whitespace-pre-wrap">{payment.catatan}</p>}
                      <a href={getViewUrl(payment.bukti_drive_file_id)} target="_blank" rel="noopener noreferrer" className="block rounded-lg py-2 font-medium text-primary underline underline-offset-4">Lihat Bukti<span className="sr-only"> (tab baru)</span></a>
                      {payment.kwitansi_drive_file_id ? <a href={getViewUrl(payment.kwitansi_drive_file_id)} target="_blank" rel="noopener noreferrer" className="block rounded-lg py-2 font-medium text-primary underline underline-offset-4">Lihat Kwitansi<span className="sr-only"> (tab baru)</span></a> : <p className="text-muted-foreground">Kwitansi belum tersedia.</p>}
                    </> : <PaymentForm student={student} bulan={bulan} tahun={tahun} period={`${month} ${tahun}`} today={today} />}
                  </div>
                </details>;
              })}
            </div>
          </div>
        </details>)}
      </div>}
    </div>
  );
}
