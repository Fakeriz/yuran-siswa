# UI/UX & Design System Guidelines

## Aplikasi Pencatat Yuran Bulanan Siswa

---

### 1. Filosofi Desain

- **Minimalisme & kejelasan:** antarmuka fokus pada konten utama, minim
  dekorasi. Hierarki dibangun lewat tipografi dan whitespace, bukan
  garis tebal.
- Bahasa antarmuka: **Bahasa Indonesia**.

### 2. Bentuk & Geometri

- Sudut melengkung yang lembut untuk card, modal/dialog, tombol, dan input.
  Implementasi Tailwind: `rounded-2xl` / `rounded-3xl` + bayangan halus
  (`shadow-sm` / `shadow-md`). Catatan: ini *mendekati* efek squircle;
  squircle sejati membutuhkan CSS khusus (mis. `clip-path`/mask SVG) —
  hanya dipakai bila benar-benar dibutuhkan.
- Border tipis: `border` (1px) dengan warna netral transparan
  (mis. `border-slate-200/50`). (`border-px` bukan class Tailwind yang valid.)

### 3. Warna & Tema

- Mendukung **Light Mode** dan **Dark Mode** (class `dark` Tailwind).
- Background konten: putih solid (`bg-white`) / sangat gelap (`bg-zinc-950`).
- Halaman auth / area non-konten: latar tematik solid 100%, tanpa gradien.

### 4. Daftar Layar (14 layar)

**Login & Daftar**

1. **Login** — form email + password, tombol Masuk, link "Daftar sebagai
   orang tua", pesan error bila gagal.
2. **Daftar orang tua** — nama, email, password, cari & pilih anak (bisa
   lebih dari satu), tombol Daftar → halaman info "menunggu persetujuan".

**Staff**

3. **Dashboard** — pemilih bulan/tahun, kartu ringkasan (sudah X, belum Y),
   filter Semua/Sudah/Belum, daftar anak didik (nama, kelas, badge status),
   tombol "Catat" per siswa.
4. **Form catat bayar** (pop-up) — nama siswa & bulan terkunci, jumlah
   terisi otomatis sesuai yuran (dapat diubah), tanggal default hari ini,
   upload bukti (foto/kamera), catatan opsional, tombol Simpan.
5. **Pilih grup** — daftar grup dengan centang, tombol Simpan.

**Orang tua**

6. **Beranda** — kartu per anak (nama + status bulan berjalan).
7. **Detail anak** — 12 kotak bulan (hijau = sudah, merah = belum);
   klik untuk lihat detail atau input.
8. **Detail pembayaran** — jumlah, tanggal, tombol Lihat Bukti, tombol
   Lihat Kwitansi (bila sudah diupload admin).
9. **Form bayar** — sama seperti form staff, terkunci untuk anaknya sendiri.

**Admin**

10. **Tab Persetujuan** — daftar pengajuan (nama ortu, anak yang diklaim,
    peringatan bila anak sudah diklaim akun lain), tombol Setuju/Tolak.
11. **Tab Penugasan staff** — daftar staff dan grup pilihannya (read-only).
12. **Tab Siswa** — tabel + pencarian, tombol Tambah, edit/nonaktifkan
    per baris.
13. **Tab Akun** — daftar akun per peran, buat akun baru, hubung/putuskan anak.
14. **Tab Kwitansi** — daftar pembayaran yang belum ada kwitansinya,
    tombol Upload per baris.

### 5. Layout Spesifik

- **Portal orang tua:** mobile-first; riwayat/tagihan memakai tumpukan
  kartu yang bisa di-expand saat diklik.
- **Dashboard admin & staf:** sidebar kiri + area konten kanan (nyaman
  untuk tablet/desktop); tabel status bulanan dengan badge hijau
  (lunas) / merah-kuning (tertunggak) yang kontras dan mudah dibaca
  saat presentasi rapat.

### 6. Tipografi & Lokalisasi

- Font sans-serif modern dan bersih (Inter, Geist, atau sejenisnya).
- **Mata uang:** Ringgit Malaysia — format `RM 1,234.50`.
- **Bulan:** nama bulan Bahasa Indonesia (Januari–Desember) di dropdown
  dan riwayat.

### 7. Micro-interactions

- Transisi singkat `150ms–200ms`, `ease-in-out`, untuk hover tombol,
  buka modal, dan expand kartu.
- Notifikasi sukses/gagal memakai Toast (mis. Sonner): "Pembayaran
  berhasil disimpan".