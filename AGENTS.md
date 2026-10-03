# AGENTS.md — Yuran Siswa

Aplikasi web pencatat yuran bulanan siswa.
Stack: Next.js 15 (App Router) + TypeScript + Tailwind, Supabase
(PostgreSQL + Auth), Google Drive API untuk file, deploy ke
Cloudflare Pages.

## Dokumen acuan (baca yang relevan sebelum mengerjakan task)

- `docs/prd.md` — kebutuhan produk & peran (admin / staff / orang tua)
- `docs/architecture.md` — tech stack & struktur folder
- `docs/design.md` — panduan visual & daftar 14 layar
- `docs/rules.md` — aturan coding
- `docs/integrations.md` — integrasi Google Drive
- `docs/schema.sql` — skema database + RLS
- `docs/superpowers/specs/2026-10-03-yuran-siswa-design.md` — spec desain
- `docs/superpowers/plans/2026-10-03-yuran-siswa.md` — implementation plan

## Aturan kualitas output

Selalu ikuti `antislop.md` untuk setiap output UI, teks, dan kode:
tolak desain generik, angka/statistik karangan, copy filler, dan
komentar kode sampah. Arah visual mengikuti `docs/design.md`.

## Cara kerja

- Kerjakan SATU task dari implementation plan dalam satu waktu;
  jangan lompat ke task berikutnya sebelum task saat ini beres.
- TDD: tulis test yang gagal dulu → implementasi → pastikan lulus →
  commit per task.
- Bahasa UI: Bahasa Indonesia. Mata uang: RM (Ringgit Malaysia).
- Jangan tambah library NPM tanpa izin.
- File bukti/kwitansi HANYA ke Google Drive (jangan pakai
  Supabase Storage). Semua aturan akses ditegakkan via RLS.
