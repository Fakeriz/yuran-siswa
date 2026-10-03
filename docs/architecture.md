# Arsitektur & Tech Stack

## Aplikasi Pencatat Yuran Bulanan Siswa

---

### 1. Ringkasan Arsitektur

Serverless: Next.js App Router menangani tampilan + logika server,
Supabase menyediakan PostgreSQL + Auth, Google Drive API menyimpan file.
Deploy ke Cloudflare Pages.

### 2. Tech Stack

#### A. Frontend

- **Framework:** Next.js 15 (App Router), React, TypeScript `strict`.
- **Styling:** Tailwind CSS + Shadcn UI.
- **Komponen:** Server Components sebagai default; `"use client"` hanya
  untuk interaktivitas.
- **Mutasi data:** Next.js Server Actions (bukan API Routes, kecuali
  benar-benar perlu).
- **State ringan:** React Context bila perlu; form memakai validasi
  di server action.

#### B. Backend, Database & Auth

- **Supabase:** PostgreSQL + Supabase Auth (email & password).
- **Keamanan:** Row Level Security (RLS) aktif dan ketat di semua tabel —
  peran admin/staff/orang\_tua ditegakkan di database.
- **Supabase Storage TIDAK dipakai** (keputusan produk).

#### C. File Storage

- **Google Drive API** (service account): bukti pembayaran & kwitansi
  diupload ke satu folder Drive khusus; database hanya menyimpan file ID.
  Detail: lihat `integrations.md`.

#### D. Hosting & CI/CD

- **Deploy:** Cloudflare Pages via `@cloudflare/next-on-pages`.
- Kode sisi server harus edge-compatible (tidak memakai API khusus Node
  kecuali `nodejs_compat` diaktifkan dan didokumentasikan).
- **Version control:** GitHub → auto-deploy ke Cloudflare setiap push
  ke branch utama.

#### E. Testing

- **Vitest** untuk unit test (logika status bayar, aturan akses).

#### F. Ditegaskan TIDAK dipakai

- Supabase Storage, Supabase Edge Functions untuk webhook, bot Telegram,
  Gemini OCR. (Semua pernah muncul di draft lama dan sudah dikeluarkan
  dari scope.)

### 3. Struktur Folder

```text
/app
  /(auth)/login          # halaman login
  /(auth)/daftar         # pendaftaran mandiri orang tua
  /staff                 # dashboard + form catat bayar
  /staff/grup            # staff pilih grupnya
  /orangtua              # portal orang tua
  /admin                 # tab: persetujuan, penugasan, siswa, akun, kwitansi
/components              # komponen UI reusable
/lib
  /supabase              # client browser & server
  auth.ts                # getProfile, requireRole, myStudentIds, myGroups
  drive.ts               # uploadFile, getViewUrl (Google Drive)
  fees.ts                # logika status bayar (pure)
  /actions               # payments.ts, admin.ts, staff.ts (server actions)
/types                   # tipe TypeScript
/tests                   # unit test (vitest)
/supabase/migrations     # skema + RLS
```

### 4. Panduan Visual

Lihat `design.md` — satu-satunya acuan keputusan visual (tidak diduplikasi
di dokumen ini).