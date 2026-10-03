# Yuran Siswa

Pencatat yuran bulanan siswa. Task 1 menyediakan scaffold Next.js 15
(App Router), TypeScript strict, Tailwind CSS, dan logika domain pembayaran.
Halaman awal masih berupa placeholder; autentikasi dan penyimpanan data
belum diimplementasikan.

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
