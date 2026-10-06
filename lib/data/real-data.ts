/**
 * Data siswa dan pembayaran asli dari spreadsheet "Aylik Talebe 2026".
 * Diimpor pada 2026-10-05. Menggantikan data dummy.
 *
 * Konvensi spreadsheet:
 * - Angka (500/375) = belum dibayar (tidak ada record pembayaran)
 * - Tanggal (19.9.26) = sudah dibayar pada tanggal tersebut
 * - Kosong = sudah dibayar, tanggal tidak tercatat
 * - Kolom Januari = yuran Januari + yuran pendaftaran tahunan
 */

export interface RealStudent {
  id: string;
  nama: string;
  grup: string;
  kelas: string;
  yuran_per_bulan: number;
  is_active: boolean;
}

export interface RealPayment {
  id: string;
  student_id: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  tanggal_bayar: string;
  catatan: string | null;
}

export const REAL_STUDENTS: RealStudent[] = [];

export const REAL_PAYMENTS: RealPayment[] = [];
