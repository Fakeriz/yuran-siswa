# Yuran Siswa

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
diarahkan ke `/`, halaman awal sementara sampai dashboard tersedia.
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
`googleapis` dipasang sesuai rencana, tetapi belum diimpor oleh kode server;
kompatibilitas integrasi Drive harus diverifikasi pada Task 4.

`@cloudflare/next-on-pages` sudah deprecated dan peer dependency-nya
membatasi Next.js sampai 15.5.2. Scaffold tetap memakai 15.5.27 dengan
override khusus untuk peer Next.js, serta peer `@cloudflare/workers-types`
agar sesuai dengan Wrangler. Tidak menggunakan `--force` atau
`--legacy-peer-deps`. Override bukan jaminan kompatibilitas aplikasi lengkap;
jalankan kembali build edge saat menambah fitur. Konfigurasi deployment
dan kredensial layanan tetap mengikuti Task 11.

Dokumen kebutuhan, desain, integrasi, dan rencana ada di `docs/`.
