# Integrations & External APIs

## Aplikasi Pencatat Yuran Bulanan Siswa

Acuan integrasi layanan pihak ketiga.

---

## 1. Penyimpanan Dokumen — Google Drive API (satu-satunya)

Bukti pembayaran dan kwitansi disimpan di **Google Drive**. Supabase
Storage **tidak dipakai**.

### A. Konfigurasi

1. Buat Google Cloud project → aktifkan **Google Drive API**.
2. Buat **service account** → unduh kunci JSON.
3. Buat folder khusus (mis. `YuranSiswa`) di **Shared Drive Google
   Workspace**, lalu berikan service account izin menambah file.
   Folder My Drive biasa yang dibagikan ke service account tidak cukup:
   service account tidak punya kuota penyimpanan dan tidak bisa memiliki
   file. Implementasi ini tidak melakukan delegasi ke akun pengguna.
   Acuan: [Shared drives overview](https://developers.google.com/workspace/drive/api/guides/about-shareddrives).
4. Environment variables:

- `DRIVE_SERVICE_ACCOUNT_JSON` — isi file JSON service account.
- `DRIVE_FOLDER_ID` — ID folder Drive khusus.

### B. Alur Upload (bukti & kwitansi)

1. Server action menerima file → validasi tipe (gambar/PDF) dan ukuran
   (maks 10 MB).
2. `lib/drive.ts` memakai Google Drive REST API melalui `fetch` dan
   Web Crypto, tanpa impor runtime `googleapis` atau API Node.js.
   Signature tetap `uploadFile(data: Buffer, filename: string,
   mimeType: string): Promise<string>`; `Buffer` hanya impor tipe.
3. Baca kredensial dari `DRIVE_SERVICE_ACCOUNT_JSON`, buat JWT RS256
   dengan `crypto.subtle` (kunci PKCS8), lalu tukarkan di
   `https://oauth2.googleapis.com/token`. Scope:
   `https://www.googleapis.com/auth/drive.file`. Kunci, JWT, dan token
   hanya digunakan di server dan tidak dicatat ke log.
4. Mulai sesi upload dengan `POST` ke
   `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id&supportsAllDrives=true`.
   Metadata berisi `parents: [DRIVE_FOLDER_ID]` dan nama
   `{student_id}_{tahun}-{bulan:02d}_{jenis}_{uuid}.{ext}`
   (`jenis` = `bukti` atau `kwitansi`), yang disiapkan pemanggil.
   Kirim byte file lewat satu `PUT` ke URL `Location` dari respons.
   Protokol resumable mendukung batas aplikasi 10 MB; retry/resume
   otomatis belum diimplementasikan. Timeout tiap request 60 detik.
5. Setelah upload berhasil, kembalikan ID file lalu simpan ke `bukti_drive_file_id` /
   `kwitansi_drive_file_id` di tabel `payments`.
   Respons HTTP gagal atau ID kosong membuat fungsi melempar error;
   pemanggil tidak boleh membuat baris pembayaran jika upload gagal.
6. Tidak ada pembuatan permission `anyone`; akses mengikuti folder Drive.
   Pastikan folder tujuan tidak publik. URL sesi upload dibatasi ke
   endpoint Google yang diharapkan dan redirect HTTP ditolak.

Test menggunakan mock `fetch` dan pasangan kunci RSA sementara untuk
memverifikasi JWT serta byte upload. Verifikasi manual dengan kredensial
Drive asli ditunda sampai kredensial tersedia; nanti upload satu file
kecil, periksa folder dan aksesnya, lalu hapus file uji.

### C. Alur Lihat File

- Aplikasi membuat URL lihat dari file ID (`getViewUrl`) dan menampilkannya
  sebagai tombol "Lihat Bukti" / "Lihat Kwitansi".
- Jangan mengekspos service account atau membagikan link permanen publik.

---

## 2. Ditegaskan TIDAK dipakai

- Supabase Storage (bucket `payment_documents` dari draft lama dihapus).
- Notifikasi Telegram/WhatsApp/email otomatis.
- OCR bukti transfer (Gemini atau lainnya).
- Webhook pembayaran / Edge Functions.
