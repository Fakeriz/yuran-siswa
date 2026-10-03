# Spec Desain: Aplikasi Pencatat Yuran Bulanan Siswa

Tanggal: 2026-10-03
Status: Menunggu review (revisi 2)

## 1. Ringkasan

Aplikasi web untuk mencatat yuran bulanan siswa. Staf dan orang tua dapat
mencatat pembayaran beserta bukti; admin mengelola data master, akun,
persetujuan pendaftaran, dan mengupload kwitansi resmi. Orang tua mendaftar
sendiri dan memilih anaknya, lalu menunggu persetujuan admin/staff.

## 2. Pengguna & Peran

| Peran     | Akses |
|-----------|-------|
| Admin     | Semua: kelola data siswa, kelola akun, hubungkan siswa ke orang tua & staff, input pembayaran untuk semua siswa, upload kwitansi, approve pendaftaran orang tua, lihat penugasan staff |
| Staff     | Pilih grupnya sendiri (langsung aktif, tanpa approval); input pembayaran + upload bukti hanya untuk anak didiknya; approve pendaftaran orang tua untuk anak didiknya; lihat daftar bayar/belum untuk anak didiknya |
| Orang tua | Daftar akun sendiri + pilih anaknya (menunggu persetujuan); setelah disetujui: input pembayaran + upload bukti untuk anaknya, lihat status, bukti, dan kwitansi |

- Login memakai email + password (Supabase Auth).
- Satu akun orang tua dapat terhubung ke lebih dari satu anak.
- Satu staff dapat memilih satu atau beberapa grup.

## 3. Arsitektur

- **Next.js** (App Router): satu aplikasi untuk tampilan dan logika server.
- **Deploy**: Cloudflare Pages, memakai adapter `@cloudflare/next-on-pages`.
- **Database & auth**: Supabase (PostgreSQL + Supabase Auth).
- **Penyimpanan file** (bukti pembayaran & kwitansi): Google Drive. Aplikasi
  mengupload file ke folder Drive khusus via Google Drive API (service
  account); ID file yang dikembalikan disimpan di database. Supabase
  Storage tidak dipakai.

Kebutuhan akun/layanan: akun Cloudflare, project Supabase, Google Cloud
project dengan Drive API aktif + service account + satu folder Drive khusus.

## 4. Struktur Data (Supabase)

- **students**: id, nama, grup, kelas, yuran_per_bulan, status (aktif/nonaktif)
- **profiles**: id (merujuk ke auth.users), nama, peran (admin/staff/orang_tua)
- **parent_students**: parent_id, student_id, status (pending/approved),
  requested_at, approved_by — pengajuan hubungan orang tua–anak
- **staff_groups**: staff_id, grup — penugasan grup yang dipilih sendiri
  oleh staff, langsung aktif tanpa persetujuan
- **payments**: id, student_id, bulan, tahun, jumlah, tanggal_bayar,
  bukti_drive_file_id, kwitansi_drive_file_id (nullable, diisi admin),
  dicatat_oleh (id pencatat), catatan, created_at

Status "sudah/belum bayar" dihitung otomatis dari ada/tidaknya baris
pembayaran untuk pasangan (siswa, bulan, tahun) — tidak disimpan manual,
sehingga tidak mungkin berbeda dari datanya.

## 5. Alur Utama

### Pendaftaran orang tua

1. Orang tua daftar akun (nama, email, password) → pilih nama anaknya
   dari daftar siswa.
2. Akun langsung bisa login, tapi belum melihat data anak — tampil pesan
   "menunggu persetujuan".
3. Admin/staff melihat daftar pengajuan pending di tab admin → approve/tolak.
4. Setelah diapprove, orang tua bisa melihat dan mencatat untuk anaknya.

### Staff

1. Login → pilih grup yang diajar (bisa beberapa) → langsung aktif.
2. Pilih bulan & tahun → daftar anak didiknya tampil dengan status
   bayar/belum.
3. Untuk yang membayar: isi jumlah + tanggal, upload bukti, simpan.
4. Filter "belum bayar" untuk melihat tunggakan anak didiknya.
5. Melihat daftar pengajuan orang tua untuk anak didiknya →
   approve/tolak.

### Orang tua (setelah disetujui)

1. Login → daftar anaknya.
2. Pilih anak → daftar bulan dengan status sudah/belum bayar.
3. Untuk bulan yang belum bayar: input pembayaran (jumlah, tanggal,
   upload bukti) → simpan.
4. Klik bulan yang sudah bayar → lihat detail, bukti, dan kwitansi
   (jika sudah diupload admin).

### Admin

Semua yang bisa dilakukan staff (untuk semua siswa), plus:

1. Tambah/edit/nonaktifkan data siswa.
2. Kelola akun staff & orang tua.
3. Hubungkan/putuskan siswa ke akun orang tua dan ke grup staff.
4. Tab admin: daftar pengajuan pendaftaran orang tua (approve/tolak)
   dan daftar penugasan staff per grup (tampil saja).
5. Untuk pembayaran yang sudah tercatat: upload file kwitansi resmi.

## 6. Keamanan

- Row Level Security di Supabase:
  - orang tua: baca/tulis pembayaran hanya untuk anaknya yang sudah
    approved; boleh membuat pengajuan baru (status pending) untuk
    dirinya sendiri;
  - staff: baca/tulis pembayaran hanya untuk siswa di grupnya; boleh
    approve pengajuan orang tua untuk siswa di grupnya; boleh
    menambah/menghapus penugasan grup untuk dirinya sendiri;
  - admin: akses penuh, termasuk approve pengajuan untuk semua siswa
    dan menulis kolom kwitansi.
  Aturan ditegakkan di database, bukan hanya di tampilan.
- File bukti & kwitansi di Google Drive diset tidak publik; hanya dapat
  dibuka lewat aplikasi oleh pihak yang berhak.
- Semua aksi tulis divalidasi di sisi server.

## 7. Testing

- Manual: tiap alur utama dicoba per peran (daftar + approve orang tua,
  pilih grup staff, input bayar oleh staff/ortu, upload bukti & kwitansi,
  cek tunggakan).
- Otomatis: unit test untuk logika status bayar per bulan dan aturan
  akses data per peran (termasuk batasan grup staff dan status approval).

## 8. Scope v1 / Non-goals

Masuk v1: pendaftaran mandiri orang tua + persetujuan, penugasan grup
mandiri oleh staff, input pembayaran oleh staff & orang tua, daftar
sudah/belum bayar, bukti pembayaran di Google Drive, upload kwitansi
manual oleh admin, tiga peran pengguna.

Tidak masuk v1: kwitansi dibuat otomatis oleh sistem, pengingat otomatis
(WA/email), pembayaran online, aplikasi mobile native.

## 9. Asumsi & Keputusan

- Jumlah yuran per bulan bisa berbeda antar siswa (disimpan per siswa).
- Bukti pembayaran di-upload oleh yang mencatat (staff atau orang tua).
- Kwitansi resmi di-upload belakangan oleh admin ke pembayaran terkait.
- Akun orang tua langsung bisa login setelah daftar, tapi belum melihat
  data anak sampai pengajuannya disetujui.
- Staff hanya bisa menyetujui pendaftaran orang tua untuk siswa di
  grupnya; admin untuk semua siswa.
- Bahasa antarmuka v1: Bahasa Indonesia.
- Periode pembayaran dihitung per bulan kalender (Januari–Desember).
