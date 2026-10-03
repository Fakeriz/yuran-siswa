# Product Requirements Document (PRD)

## Aplikasi Pencatat Yuran Bulanan Siswa

---

### 1. Ringkasan Produk

Aplikasi web untuk mencatat dan memantau pembayaran yuran bulanan siswa.
Staf dan orang tua mencatat pembayaran beserta bukti (file disimpan di
Google Drive); admin mengelola data master, persetujuan pendaftaran, dan
mengupload kwitansi resmi.

### 2. Peran Pengguna

1. **Admin**

- Mengelola data siswa (nama, grup, kelas, yuran per bulan, aktif/nonaktif).
- Mengelola akun staf dan orang tua.
- Menghubungkan siswa ke akun orang tua dan ke grup staf.
- Menyetujui/menolak pendaftaran orang tua.
- Mencatat pembayaran untuk semua siswa.
- Mengupload kwitansi resmi ke pembayaran yang sudah tercatat.
- Melihat penugasan grup tiap staf.

2. **Staf**

- Memilih grupnya sendiri (langsung aktif, tanpa persetujuan).
- Mencatat pembayaran + upload bukti **hanya** untuk anak didiknya
     (siswa di grupnya).
- Menyetujui/menolak pendaftaran orang tua **hanya** untuk anak didiknya.
- Melihat daftar sudah/belum bayar untuk anak didiknya.

3. **Orang Tua**

- Mendaftar akun sendiri (nama, email, password) lalu memilih anaknya
     dari daftar siswa → status pengajuan *pending*.
- Akun langsung bisa login, tetapi belum melihat data anak sampai
     pengajuannya disetujui (tampil pesan "menunggu persetujuan").
- Setelah disetujui: mencatat pembayaran + upload bukti untuk anaknya,
     melihat status per bulan, bukti, dan kwitansi.

Satu akun orang tua dapat terhubung ke lebih dari satu anak. Login memakai
email + password (Supabase Auth).

### 3. Fitur (MVP)

#### A. Autentikasi & Akun

- Login email + password; proteksi halaman per peran.
- Pendaftaran mandiri orang tua + pilih anak.
- Hak akses berbasis peran (RBAC) yang ditegakkan di database (RLS),
  bukan hanya di tampilan.

#### B. Persetujuan Pendaftaran

- Daftar pengajuan *pending* (nama ortu, anak yang diklaim).
- Peringatan jika anak yang diklaim sudah terhubung ke akun ortu lain —
  klaim kedua tetap *pending* sampai admin memutuskan.
- Admin dapat menyetujui untuk semua siswa; staf hanya untuk grupnya.

#### C. Penugasan Staf

- Staf memilih satu/beberapa grup untuk dirinya sendiri.
- Penugasan tampil di tab admin (read-only).

#### D. Data Siswa

- CRUD oleh admin: nama, grup, kelas, yuran per bulan, aktif/nonaktif.

#### E. Pencatatan Pembayaran

- Form: siswa (terkunci sesuai hak akses), bulan + tahun, jumlah
  (terisi otomatis sesuai yuran siswa, dapat diubah), tanggal
  (default hari ini), upload bukti (gambar/PDF, maks 10 MB),
  catatan opsional, pencatat terisi otomatis.
- Satu baris pembayaran per (siswa, bulan, tahun) — duplikat ditolak
  dengan pesan "sudah tercatat".
- Status sudah/belum bayar dihitung otomatis dari ada/tidaknya baris
  pembayaran; tidak disimpan manual.

#### F. Daftar & Tunggakan

- Daftar siswa per bulan dengan badge status; filter "belum bayar".

#### G. Kwitansi

- Admin mengupload file kwitansi ke pembayaran yang sudah tercatat.
- Kwitansi **tidak** dibuat otomatis oleh sistem.

#### H. Portal Orang Tua

- Kartu per anak + status bulan berjalan.
- 12 kotak bulan (hijau = sudah, merah = belum); klik untuk detail.
- Detail: jumlah, tanggal, tombol Lihat Bukti, tombol Lihat Kwitansi
  (jika sudah diupload admin).

### 4. Entitas Data

| Entitas | Kolom kunci |
| --- | --- |
| `profiles` | `id` (auth.users), `nama`, `peran` (admin/staff/orang\_tua) |
| `students` | `id`, `nama`, `grup`, `kelas`, `yuran_per_bulan`, `is_active` |
| `parent_students` | `parent_id`, `student_id`, `status` (pending/approved), `requested_at`, `approved_by` |
| `staff_groups` | `staff_id`, `grup` |
| `payments` | `id`, `student_id`, `bulan`, `tahun`, `jumlah`, `tanggal_bayar`, `bukti_drive_file_id`, `kwitansi_drive_file_id` (nullable), `dicatat_oleh`, `catatan`; UNIQUE(`student_id`, `bulan`, `tahun`) |

### 5. Aturan Bisnis

1. Satu akun orang tua ↔ banyak anak (via `parent_students` berstatus
   approved). Satu anak dapat diklaim lebih dari satu akun; klaim
   berikutnya tetap pending sampai diputuskan admin.
2. Staf hanya dapat input/melihat pembayaran siswa di grupnya, dan hanya
   dapat menyetujui pendaftaran orang tua untuk grupnya.
3. Hanya admin yang dapat mengisi/mengubah `kwitansi_drive_file_id`.
4. File bukti & kwitansi disimpan di Google Drive (tidak publik); di
   database hanya menyimpan file ID. Supabase Storage tidak dipakai.
5. Status bayar = ada/tidaknya baris `payments` untuk (siswa, bulan, tahun).

### 6. Non-MVP (nanti / butuh persetujuan)

- Kwitansi dibuat otomatis oleh sistem.
- Notifikasi otomatis (WhatsApp/Telegram/email).
- Pembayaran online.
- Export Excel/PDF & import massal data siswa.
- Aplikasi mobile native.
- OCR bukti transfer.