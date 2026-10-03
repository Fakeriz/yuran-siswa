import type { Payment, Student } from "./types";

export function paymentStatusFor(
  payments: Payment[],
  studentId: string,
  bulan: number,
  tahun: number,
): "sudah" | "belum" {
  return payments.some(
    (payment) =>
      payment.student_id === studentId &&
      payment.bulan === bulan &&
      payment.tahun === tahun,
  )
    ? "sudah"
    : "belum";
}

export function unpaidStudents(
  students: Student[],
  payments: Payment[],
  bulan: number,
  tahun: number,
): Student[] {
  return students.filter(
    (student) =>
      student.status === "aktif" &&
      paymentStatusFor(payments, student.id, bulan, tahun) === "belum",
  );
}

export function validatePaymentInput(input: {
  student_id: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  tanggal_bayar: string;
}): string[] {
  const errors: string[] = [];

  if (!input.student_id.trim()) {
    errors.push("Siswa wajib dipilih.");
  }

  if (!Number.isInteger(input.bulan) || input.bulan < 1 || input.bulan > 12) {
    errors.push("Bulan harus bilangan bulat antara 1 dan 12.");
  }

  if (!Number.isFinite(input.jumlah) || input.jumlah <= 0) {
    errors.push("Jumlah harus berupa angka yang lebih besar dari nol.");
  }

  const date = new Date(input.tanggal_bayar);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.tanggal_bayar) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== input.tanggal_bayar
  ) {
    errors.push("Tanggal bayar harus tanggal yang valid dalam format YYYY-MM-DD.");
  }

  return errors;
}
