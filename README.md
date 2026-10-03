# Yuran Siswa

## Cloudflare Pages

Hubungkan repo melalui dashboard Cloudflare Pages. Gunakan pengaturan:

- Framework preset: Next.js.
- Build command: `npm run build:pages` (setara `npx @cloudflare/next-on-pages`).
- Build output directory: `.vercel/output/static`.
- Root directory: akar repo.
- Node.js: `NODE_VERSION=22`.
- Compatibility date dan flag dibaca dari `wrangler.toml`: `2026-10-03`,
  `nodejs_compat`, untuk Preview maupun Production.

CLI adapter 1.13.16 tidak menerima subcommand `build`. Build langsung
menjalankan Vercel build lokal sebagai tahap bundling, bukan deploy ke Vercel.
`vercel.json` melewati instalasi kedua karena dependency sudah dipasang oleh
build image Pages (atau `npm ci` saat setup lokal). Jangan set build command
dashboard ke `npm run build`, karena itu belum menghasilkan worker Pages.

Salin `.env.example` ke `.env.local` untuk lokal. Di dashboard, isi setiap env
untuk Preview dan Production. `NEXT_PUBLIC_SUPABASE_*` harus tersedia saat
build dan identik dengan pasangan `SUPABASE_*`. Simpan service-role key dan
JSON service account Drive sebagai secret server. Folder bukti/kwitansi wajib
berada di Shared Drive dan service account harus memiliki izin membuat file.
Jangan memasukkan kredensial ke `wrangler.toml` atau repo.

Terapkan seluruh migrasi Supabase sebelum memakai aplikasi. Deploy preview
belum dilakukan; koneksi repo dan kredensial Cloudflare diatur melalui dashboard.

## Administrasi akun

Pembuatan akun pada `/admin?tab=akun` membutuhkan
`SUPABASE_SERVICE_ROLE_KEY` sebagai secret server (jangan memakai prefix
`NEXT_PUBLIC_`). Key ini hanya dipakai untuk API administrasi Supabase Auth
setelah peran admin diverifikasi. Operasi tabel tetap memakai sesi admin dan
RLS. Akun buatan admin langsung dikonfirmasi; bagikan kata sandi melalui jalur
yang sesuai. Jika pembuatan profil gagal, akun Auth baru dibatalkan.

## Pilihan grup staf

Terapkan migrasi `20261003020000_staff_groups.sql` sebelum memakai
`/staff/grup`. Fungsi penggantian grup memakai identitas sesi, RLS, dan satu
transaksi; daftar kosong melepas seluruh grup staf yang sedang masuk.

## Pendaftaran orang tua

Terapkan migrasi `20261003010000_parent_registration.sql` sebelum memakai
`/daftar`. Trigger signup membuat profil orang tua dan semua klaim `pending`
dalam transaksi yang sama. RPC publik `registration_students` hanya membuka
ID, nama, dan kelas siswa aktif untuk pemilihan anak; data pembayaran tetap privat.
Konfirmasi email mengikuti pengaturan Supabase Auth.

Schema memakai status `pending`/`approved`: keputusan tolak mempertahankan
`pending` dan mencatat reviewer pada `approved_by`, tanpa memberi akses anak.

Pencatat yuran bulanan siswa. Task 1 menyediakan scaffold Next.js 15
(App Router), TypeScript strict, Tailwind CSS, dan logika domain pembayaran.
Halaman awal masih berupa placeholder. Task 3 menambahkan login email dan
kata sandi di `/login`, client Supabase, serta helper autentikasi.

## Konfigurasi Supabase

Isi `.env.local` dengan `NEXT_PUBLIC_SUPABASE_URL` dan
`NEXT_PUBLIC_SUPABASE_ANON_KEY` dari project Supabase. Browser memerlukan
kedua nama tersebut pada waktu build. Server juga menerima `SUPABASE_URL`
dan `SUPABASE_ANON_KEY` sebagai fallback. Gunakan anon key, bukan service-role
key. Akun dan baris `profiles` harus tersedia di Supabase.

Login memakai Server Action dan cookie sesi. Setelah berhasil, pengguna
diarahkan sesuai peran ke `/admin`, `/staff`, atau `/orangtua`.
Middleware memvalidasi pengguna dan menyegarkan sesi untuk `/staff`,
`/orangtua`, `/admin`, termasuk subhalamannya. Pemeriksaan peran dilakukan
oleh `requireRole` dan akses database tetap tunduk pada RLS.

Client server secara default read-only untuk Server Components. Gunakan
`createClient({ readOnly: false })` dalam Server Action yang menulis cookie,
seperti login. Jangan memakai client read-only untuk sign-in/sign-out.

## Menjalankan proyek

Gunakan Node.js 22.12+ atau 24 LTS dan npm.

```sh
npm ci
npm run dev
```

## Verifikasi

```sh
npx vitest run
npm run typecheck
npm run build
npx @cloudflare/next-on-pages
```

## Kontrak domain

- `paymentStatusFor`: sudah bayar jika baris pembayaran cocok dengan
  siswa, bulan, dan tahun. Jumlah tidak dibandingkan dengan tarif siswa.
- `unpaidStudents`: hanya siswa aktif yang belum mempunyai pembayaran
  untuk periode yang dipilih.
- `validatePaymentInput`: mengembalikan semua pesan kesalahan dalam
  Bahasa Indonesia. Tanggal harus tanggal kalender `YYYY-MM-DD` yang nyata,
  termasuk pemeriksaan tahun kabisat. Bulan harus bilangan bulat 1–12;
  jumlah harus bilangan terbatas yang lebih besar dari nol.
- `Student.status` mengikuti signature Task 1. Kolom SQL `is_active`
  perlu dipetakan pada tahap integrasi database.

## Catatan Cloudflare

Layout memakai runtime `edge`. Logika domain tidak mengimpor API Node.js.
`googleapis` tetap terpasang sesuai scaffold, tetapi integrasi Drive memakai
REST melalui `fetch` dan Web Crypto agar kompatibel dengan edge. Tidak ada
impor runtime `googleapis`. Detail upload dan verifikasi manual yang masih
tertunda ada di `docs/integrations.md`.

`@cloudflare/next-on-pages` sudah deprecated dan peer dependency-nya
membatasi Next.js sampai 15.5.2. Scaffold tetap memakai 15.5.27 dengan
override khusus untuk peer Next.js, serta peer `@cloudflare/workers-types`
agar sesuai dengan Wrangler. Tidak menggunakan `--force` atau
`--legacy-peer-deps`. Override bukan jaminan kompatibilitas aplikasi lengkap;
jalankan kembali build edge saat menambah fitur. Konfigurasi deployment
dan kredensial layanan tetap mengikuti Task 11.

Dokumen kebutuhan, desain, integrasi, dan rencana ada di `docs/`.
