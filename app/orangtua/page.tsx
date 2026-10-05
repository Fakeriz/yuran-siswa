import { myStudentIds } from "../../lib/auth";
import { getViewUrl } from "../../lib/drive";
import { paymentStatusFor } from "../../lib/fees";
import { createClient } from "../../lib/supabase/server";
import type { Payment, Student } from "../../lib/types";
import { PaymentForm } from "../staff/payment-form";
import { UserBar } from "../../components/user-bar";
import { GlowBackground } from "../../components/glow-background";

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
    const demoStudents: Student[] = [
      { id: "demo-student-1", nama: "Ahmad Albab", grup: "Grup A", kelas: "Tahun 1 Amanah", yuran_per_bulan: 50, status: "aktif" },
      { id: "demo-student-2", nama: "Siti Nurhaliza", grup: "Grup A", kelas: "Tahun 2 Bestari", yuran_per_bulan: 60, status: "aktif" },
    ];
    students = demoStudents;
    payments = [
      { id: "demo-pay-1", student_id: "demo-student-1", bulan: 1, tahun, jumlah: 50, tanggal_bayar: `${tahun}-01-15`, bukti_drive_file_id: "demo-file", kwitansi_drive_file_id: null, dicatat_oleh: null, catatan: "Transfer Bank" },
      { id: "demo-pay-2", student_id: "demo-student-1", bulan: 2, tahun, jumlah: 50, tanggal_bayar: `${tahun}-02-14`, bukti_drive_file_id: "demo-file", kwitansi_drive_file_id: null, dicatat_oleh: null, catatan: "Transfer Bank" },
      { id: "demo-pay-3", student_id: "demo-student-2", bulan: 1, tahun, jumlah: 60, tanggal_bayar: `${tahun}-01-10`, bukti_drive_file_id: "demo-file", kwitansi_drive_file_id: "demo-kwitansi", dicatat_oleh: null, catatan: "Setoran Tunai" },
    ];
  }

  return (
    <div className="relative min-h-dvh flex flex-col bg-[#f7f9fc] text-slate-900 dark:bg-[#0b1329] dark:text-slate-100 [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-blue-600">
      <GlowBackground />
      <UserBar userRole="orang_tua" userName="Orang Tua Demo" title="YuranKu · Portal Orang Tua" />
      <main className="relative flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Yuran anak</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Riwayat pembayaran tahun {tahun}.</p>
      {!ids.length ? <section className="mt-8 rounded-3xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70" role="status">
        <h2 className="text-xl font-semibold">menunggu persetujuan</h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400">Data anak akan tampil setelah pengajuan disetujui oleh admin atau staf.</p>
      </section> : !students.length ? <p role="status" className="mt-8 rounded-3xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">Data anak belum tersedia. Hubungi admin untuk memeriksa hubungan akun Anda.</p> : <div className="mt-8 space-y-5">
        {students.map((student, si) => <details key={student.id} className={`rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 ${si === 0 ? "shadow-[0_24px_60px_-20px_rgba(37,99,235,0.25)]" : ""}`} open={students.length === 1}>
          <summary className="cursor-pointer rounded-3xl p-5 sm:p-6">
            <span className="ml-2 break-words text-lg font-semibold">{student.nama}</span>
            <span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">Kelas {student.kelas} · {money(student.yuran_per_bulan)} per bulan</span>
            <span className="mt-3 block text-sm">{months[currentMonth - 1]}: {paymentStatusFor(payments, student.id, currentMonth, tahun) === "sudah" ? "Sudah bayar" : "Belum bayar"}</span>
          </summary>
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Pilih bulan untuk melihat detail atau mencatat pembayaran.</p>
            <div className="grid grid-cols-1 items-start gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3">
              {months.map((month, index) => {
                const bulan = index + 1;
                const paid = paymentStatusFor(payments, student.id, bulan, tahun) === "sudah";
                const payment = payments.find((item) => item.student_id === student.id && item.bulan === bulan && item.tahun === tahun);
                return <details key={bulan} className="min-w-0 rounded-2xl border border-slate-200/70 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60">
                  <summary className={`cursor-pointer rounded-2xl p-4 text-sm ${paid ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" : "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200"}`}>
                    <span className="font-semibold">{month}</span><span className="mt-2 block">{paid ? "Sudah bayar" : "Belum bayar"}</span>
                  </summary>
                  <div className="space-y-3 break-words p-4 text-sm">
                    {payment ? <>
                      <dl className="space-y-2"><div><dt className="text-slate-500 dark:text-slate-400">Jumlah</dt><dd className="font-medium">{money(payment.jumlah)}</dd></div><div><dt className="text-slate-500 dark:text-slate-400">Tanggal bayar</dt><dd>{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" }).format(new Date(payment.tanggal_bayar))}</dd></div></dl>
                      {payment.catatan && <p className="whitespace-pre-wrap">{payment.catatan}</p>}
                      <a href={getViewUrl(payment.bukti_drive_file_id)} target="_blank" rel="noopener noreferrer" className="block rounded-lg py-2 font-medium text-blue-700 underline underline-offset-4 dark:text-blue-300">Lihat Bukti<span className="sr-only"> (tab baru)</span></a>
                      {payment.kwitansi_drive_file_id ? <a href={getViewUrl(payment.kwitansi_drive_file_id)} target="_blank" rel="noopener noreferrer" className="block rounded-lg py-2 font-medium text-blue-700 underline underline-offset-4 dark:text-blue-300">Lihat Kwitansi<span className="sr-only"> (tab baru)</span></a> : <p className="text-slate-500 dark:text-slate-400">Kwitansi belum tersedia.</p>}
                    </> : <PaymentForm student={student} bulan={bulan} tahun={tahun} period={`${month} ${tahun}`} today={today} />}
                  </div>
                </details>;
              })}
            </div>
          </div>
        </details>)}
      </div>}
        </div>
      </main>
    </div>
  );
}
