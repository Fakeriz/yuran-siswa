import { describe, expect, it } from "vitest";
import { paymentStatusFor, unpaidStudents, validatePaymentInput } from "../lib/fees";
import type { Payment, Student } from "../lib/types";

const payment: Payment = {
  id: "payment-1",
  student_id: "student-1",
  bulan: 10,
  tahun: 2026,
  jumlah: 100,
  tanggal_bayar: "2026-10-03",
  bukti_drive_file_id: "proof-1",
  kwitansi_drive_file_id: null,
  dicatat_oleh: "staff-1",
  catatan: null,
};

const students: Student[] = [
  { id: "student-1", nama: "Siswa A", grup: "A", kelas: "1", yuran_per_bulan: 100, status: "aktif" },
  { id: "student-2", nama: "Siswa B", grup: "A", kelas: "1", yuran_per_bulan: 100, status: "aktif" },
  { id: "student-3", nama: "Siswa C", grup: "B", kelas: "2", yuran_per_bulan: 150, status: "nonaktif" },
  { id: "student-4", nama: "Siswa D", grup: "B", kelas: "2", yuran_per_bulan: 150, status: "aktif" },
];

const validInput = {
  student_id: "student-1",
  bulan: 10,
  tahun: 2026,
  jumlah: 100,
  tanggal_bayar: "2026-10-03",
};

describe("paymentStatusFor", () => {
  it("returns sudah for a matching student, month, and year", () => {
    expect(paymentStatusFor([payment], "student-1", 10, 2026)).toBe("sudah");
  });

  it("returns belum when no payments exist", () => {
    expect(paymentStatusFor([], "student-1", 10, 2026)).toBe("belum");
  });

  it.each([
    ["student-2", 10, 2026],
    ["student-1", 9, 2026],
    ["student-1", 10, 2025],
  ])("does not match another student or period (%s, %i, %i)", (studentId, bulan, tahun) => {
    expect(paymentStatusFor([payment], studentId, bulan, tahun)).toBe("belum");
  });

  it("finds a matching payment after unrelated entries regardless of amount", () => {
    expect(paymentStatusFor([
      { ...payment, id: "other", student_id: "student-2" },
      { ...payment, jumlah: 1 },
    ], "student-1", 10, 2026)).toBe("sudah");
  });
});

describe("unpaidStudents", () => {
  it("excludes paid and inactive students, preserving unpaid students and order", () => {
    const payments: Payment[] = [
      payment,
      { ...payment, id: "prior-month", student_id: "student-2", bulan: 9 },
      { ...payment, id: "prior-year", student_id: "student-4", tahun: 2025 },
    ];
    const beforeStudents = structuredClone(students);
    const beforePayments = structuredClone(payments);

    expect(unpaidStudents(students, payments, 10, 2026)).toEqual([students[1], students[3]]);
    expect(students).toEqual(beforeStudents);
    expect(payments).toEqual(beforePayments);
  });

  it("returns every active student when no payments exist", () => {
    expect(unpaidStudents(students, [], 10, 2026)).toEqual([students[0], students[1], students[3]]);
  });

  it("returns no students when every active student has paid", () => {
    const payments = [payment, { ...payment, student_id: "student-2" }, { ...payment, student_id: "student-4" }];
    expect(unpaidStudents(students, payments, 10, 2026)).toEqual([]);
  });

  it("returns no students for an empty student list", () => {
    expect(unpaidStudents([], [payment], 10, 2026)).toEqual([]);
  });
});

describe("validatePaymentInput", () => {
  it("accepts a valid payment", () => {
    expect(validatePaymentInput(validInput)).toEqual([]);
  });

  it.each([1, 12])("accepts boundary month %i", (bulan) => {
    expect(validatePaymentInput({ ...validInput, bulan })).toEqual([]);
  });

  it.each([0, 13, -1, 1.5, NaN, Infinity])("rejects invalid month %s", (bulan) => {
    expect(validatePaymentInput({ ...validInput, bulan })).toEqual([expect.stringMatching(/bulan/i)]);
  });

  it.each([0, -1, NaN, Infinity, -Infinity])("rejects invalid amount %s", (jumlah) => {
    expect(validatePaymentInput({ ...validInput, jumlah })).toEqual([expect.stringMatching(/jumlah/i)]);
  });

  it("accepts a positive fractional amount", () => {
    expect(validatePaymentInput({ ...validInput, jumlah: 0.01 })).toEqual([]);
  });

  it.each(["", "   "])("rejects empty student id %j", (student_id) => {
    expect(validatePaymentInput({ ...validInput, student_id })).toEqual([expect.stringMatching(/siswa/i)]);
  });

  it.each(["", "bukan-tanggal", "2026-13-01", "2026-01-00", "2026-02-30", "2026-04-31", "2026-02-29", "1900-02-29", "03/10/2026", "2026-10-03T00:00:00Z"])(
    "rejects invalid calendar date %j",
    (tanggal_bayar) => {
      expect(validatePaymentInput({ ...validInput, tanggal_bayar })).toEqual([expect.stringMatching(/tanggal/i)]);
    },
  );

  it.each(["2024-02-29", "2000-02-29", "2026-12-31"])("accepts real calendar date %s", (tanggal_bayar) => {
    expect(validatePaymentInput({ ...validInput, tanggal_bayar })).toEqual([]);
  });

  it("collects all field errors instead of stopping after the first", () => {
    const errors = validatePaymentInput({ student_id: "", bulan: 13, tahun: 2026, jumlah: 0, tanggal_bayar: "invalid" });
    expect(errors).toHaveLength(4);
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringMatching(/siswa/i),
      expect.stringMatching(/bulan/i),
      expect.stringMatching(/jumlah/i),
      expect.stringMatching(/tanggal/i),
    ]));
  });
});
