# AI Coding Instructions & Project Rules

## Aplikasi Pencatat Yuran Bulanan Siswa

Aturan mutlak saat menghasilkan kode untuk proyek ini. Jangan menyimpang
kecuali diinstruksikan eksplisit.

### 1. Standar Kode & Arsitektur (Next.js & Supabase)

- **Framework:** Next.js (App Router). Server Components sebagai default;
  `"use client"` hanya bila butuh interaktivitas, di baris paling atas.
- **Mutasi data:** Next.js Server Actions untuk semua CRUD ke Supabase.
  Jangan buat API Routes (`/app/api`) kecuali integrasi pihak ketiga
  yang memang membutuhkannya.
- **TypeScript:** `strict: true`. Definisikan `interface`/`type` untuk
  semua props komponen dan hasil query database.
- **Supabase client:** `@supabase/ssr` untuk auth dan query. RLS harus
  selalu dihormati — jangan memakai service-role key di kode yang
  berjalan atas nama pengguna.
- **Deploy:** kode sisi server harus edge-compatible (Cloudflare Workers
  via `@cloudflare/next-on-pages`).

### 2. UI/UX & Styling

- Ikuti `design.md` sebagai satu-satunya acuan visual.
- Sudut lembut: `rounded-2xl`/`rounded-3xl` + `shadow-sm`/`shadow-md`;
  border tipis memakai `border` (bukan `border-px`).
- Portal orang tua: tumpukan kartu yang bisa di-expand untuk riwayat
  bulanan. Admin/staf: sidebar + tabel.
- Dukung penuh Light Mode dan Dark Mode.

### 3. Lokalisasi & Format Data

- **Mata uang:** Ringgit Malaysia — `RM 1,234.50` via utility formatter.
- **Bulan/tanggal:** Bahasa Indonesia (Januari–Desember). Siapkan utility
  konversi angka ↔ nama bulan.

### 4. Integrasi File (Google Drive)

- Bukti & kwitansi **hanya** ke Google Drive via service account.
  **Jangan** memakai Supabase Storage.
- Kredensial dari env: `DRIVE_SERVICE_ACCOUNT_JSON`, `DRIVE_FOLDER_ID`.
- Validasi di server action **sebelum** upload: tipe file gambar/PDF,
  ukuran maks 10 MB.
- Urutan saat mencatat pembayaran: upload ke Drive dulu, baru insert
  baris `payments`. Jika upload gagal, tidak ada baris yang ditulis.
- Detail alur: lihat `integrations.md`.

### 5. Aturan Keamanan Data

- Jangan pernah mengandalkan UI untuk proteksi: staff hanya untuk
  grupnya, ortu hanya untuk anaknya (approved), kwitansi hanya ditulis
  admin — semua ditegakkan via RLS (lihat `schema.sql`).
- Jika error terkait akses data, cek RLS dulu sebelum merombak komponen.

### 6. Aturan Interaksi AI

- Jangan berikan potongan kode terpotong. Tulis file secara lengkap,
  atau tunjukkan jelas di mana kode baru disisipkan.
- Jangan tambah library NPM baru tanpa izin.
- Jika error, prioritaskan cek tipe TypeScript atau kebijakan RLS
  sebelum merombak struktur.