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
3. Buat satu folder Drive khusus (mis. `YuranSiswa`) → share ke email
   service account dengan peran **Editor**.
4. Environment variables:

- `DRIVE_SERVICE_ACCOUNT_JSON` — isi file JSON service account.
- `DRIVE_FOLDER_ID` — ID folder Drive khusus.

### B. Alur Upload (bukti & kwitansi)

1. Server action menerima file → validasi tipe (gambar/PDF) dan ukuran
   (maks 10 MB).
2. Upload via `drive.files.create` ke `DRIVE_FOLDER_ID` dengan nama
   `{student_id}_{tahun}-{bulan:02d}_{jenis}_{uuid}.{ext}`
   (`jenis` = `bukti` atau `kwitansi`).
3. Simpan file ID yang dikembalikan ke `bukti_drive_file_id` /
   `kwitansi_drive_file_id` di tabel `payments`.
4. File di Drive diset **tidak publik** (tanpa `anyone` permission).

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