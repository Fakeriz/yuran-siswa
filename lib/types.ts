export type Role = "admin" | "staff" | "orang_tua";

export interface Student {
  id: string;
  nama: string;
  grup: string;
  kelas: string;
  yuran_per_bulan: number;
  status: "aktif" | "nonaktif";
}

export interface Profile {
  id: string;
  nama: string;
  peran: Role;
}

export interface ParentLink {
  id: string;
  parent_id: string;
  student_id: string;
  status: "pending" | "approved";
  approved_by: string | null;
}

export interface Payment {
  id: string;
  student_id: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  tanggal_bayar: string;
  bukti_drive_file_id: string;
  kwitansi_drive_file_id: string | null;
  dicatat_oleh: string | null;
  catatan: string | null;
}
