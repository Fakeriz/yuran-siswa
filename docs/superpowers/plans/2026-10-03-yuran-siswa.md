# Yuran Siswa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the yuran-siswa web app: staff and parents record monthly student fee payments with proof uploads to Google Drive, parents track their children's status, admin manages data, approvals, and kwitansi uploads.

**Architecture:** Next.js App Router (TypeScript) deployed to Cloudflare Pages via `@cloudflare/next-on-pages`; Supabase provides PostgreSQL + Auth with Row Level Security enforcing per-role access; Google Drive API (service account) stores proof/kwitansi files, file IDs kept in Postgres.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase `supabase-js` v2, `googleapis` (Drive v3), `@cloudflare/next-on-pages`, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-03-yuran-siswa-design.md`

## Global Constraints

- Deploy target is Cloudflare Pages via `@cloudflare/next-on-pages`; server code must run on Workers (edge-compatible; no Node-only APIs unless `nodejs_compat` is enabled and documented in the task).
- Files (bukti, kwitansi) go to Google Drive only — never Supabase Storage.
- All access control enforced by Supabase Row Level Security, not just UI.
- UI copy in Bahasa Indonesia.
- TDD: failing test first for every task; commit after each task.

## Review Focus

1. Parent registers and claims a child already linked+approved to another parent → expect: second request stays pending and admin sees the existing approved link before deciding. (Test in Task 7.)
2. Proof upload larger than 10 MB or not an image/PDF → expect: rejected client- and server-side with a clear message before any Drive call. (Test in Task 5.)
3. Staff crafts a request to record payment for a student outside their grup → expect: 403, no row written (RLS). (Test in Task 5.)
4. Duplicate payment submitted for the same (student, bulan, tahun) → expect: rejected with "sudah tercatat" message. (Test in Task 5.)
5. Google Drive API fails during payment recording → expect: no payment row written, user sees a clear error (upload-before-insert ordering). (Test in Task 5.)

---

## File Structure

- `lib/types.ts` — shared types: `Role`, `Student`, `Profile`, `ParentLink`, `StaffGroup`, `Payment`
- `lib/fees.ts` — pure domain logic: status per (student, bulan, tahun), tunggakan list, input validation
- `lib/supabase/client.ts`, `lib/supabase/server.ts` — browser & server Supabase clients
- `lib/auth.ts` — `getProfile`, `requireRole`, `myStudentIds` (approved only), `myGroups`
- `lib/drive.ts` — `uploadFile`, `getViewUrl` (service-account Drive API)
- `lib/actions/payments.ts` — server actions: `recordPayment`, `uploadKwitansi`
- `lib/actions/admin.ts` — server actions: `registerParent`, `approveParentLink`, student & account CRUD
- `lib/actions/staff.ts` — server actions: `assignGroups`
- `app/(auth)/login/page.tsx`, `app/(auth)/daftar/page.tsx` — auth UI
- `app/staff/page.tsx` — staff dashboard (month picker, status list, record form)
- `app/staff/grup/page.tsx` — staff self-assign grup
- `app/orangtua/page.tsx` — parent dashboard (children, monthly status, detail, input form)
- `app/admin/page.tsx` — admin tabs: persetujuan, penugasan staff, siswa, akun, kwitansi
- `supabase/migrations/20261003000000_yuran_schema.sql` — tables + RLS policies
- `tests/` mirroring `lib/`: `fees.test.ts`, `auth.test.ts`, `drive.test.ts`, `payments-action.test.ts`, `admin-action.test.ts`
- `next.config.ts`, Cloudflare Pages config, `.env.example`

---

### Task 1: Domain types + fee status logic (TDD)

**Files:**
- Create: `lib/types.ts`, `lib/fees.ts`
- Test: `tests/fees.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces:
  - `type Role = 'admin' | 'staff' | 'orang_tua'`
  - `interface Student { id: string; nama: string; grup: string; kelas: string; yuran_per_bulan: number; status: 'aktif' | 'nonaktif' }`
  - `interface Profile { id: string; nama: string; peran: Role }`
  - `interface ParentLink { id: string; parent_id: string; student_id: string; status: 'pending' | 'approved'; approved_by: string | null }`
  - `interface Payment { id: string; student_id: string; bulan: number; tahun: number; jumlah: number; tanggal_bayar: string; bukti_drive_file_id: string; kwitansi_drive_file_id: string | null; dicatat_oleh: string; catatan: string | null }`
  - `paymentStatusFor(payments: Payment[], studentId: string, bulan: number, tahun: number): 'sudah' | 'belum'`
  - `unpaidStudents(students: Student[], payments: Payment[], bulan: number, tahun: number): Student[]`
  - `validatePaymentInput(input: { student_id: string; bulan: number; tahun: number; jumlah: number; tanggal_bayar: string }): string[]` (returns error messages, empty when valid)

- [ ] **Step 0: Scaffold the project** — Run `create-next-app` with TypeScript + Tailwind (App Router); install `supabase-js`, `googleapis`, `@cloudflare/next-on-pages`; add a `vitest.config.ts`; verify `npx vitest run` starts (no tests yet is fine)
- [ ] **Step 1: Write the failing tests** in `tests/fees.test.ts`:
  - `paymentStatusFor` returns `'sudah'` when a payment exists for (student, bulan, tahun), `'belum'` otherwise
  - `unpaidStudents` excludes students with `status: 'nonaktif'` and students who paid that month
  - `validatePaymentInput` returns errors for `bulan` outside 1–12, `jumlah <= 0`, empty `student_id`, unparseable `tanggal_bayar`; returns `[]` for valid input
- [ ] **Step 2: Run tests to verify they fail** — Run: `npx vitest run tests/fees.test.ts` — Expected: FAIL (functions not defined)
- [ ] **Step 3: Implement** the types and the three functions in `lib/types.ts` / `lib/fees.ts` with the exact signatures above
- [ ] **Step 4: Run tests to verify they pass** — Run: `npx vitest run tests/fees.test.ts` — Expected: PASS
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: scaffold project and add fee status domain logic"`

### Task 2: Database schema + RLS migration

**Files:**
- Create: `supabase/migrations/20261003000000_yuran_schema.sql`

**Interfaces:**
- Consumes: table/column decisions from spec §4 (via this plan's File Structure)
- Produces: tables `students`, `profiles`, `parent_students` (with `status` pending/approved, `requested_at`, `approved_by`), `staff_groups`, `payments` (with `bukti_drive_file_id`, `kwitansi_drive_file_id` nullable); RLS enabled on all five with policies:
  - parents read/write `payments` only for approved `parent_students` links; insert `parent_students` only for self with `status='pending'`
  - staff read/write `payments` only for students in their `staff_groups`; insert/delete own `staff_groups`; update `parent_students.status` only for students in their grup
  - admin bypasses via service role / admin policy; only admin may write `kwitansi_drive_file_id`

- [ ] **Step 1: Write the migration SQL** creating the five tables, foreign keys, indexes on `(student_id, bulan, tahun)`, and the RLS policies above
- [ ] **Step 2: Verify it applies cleanly** — Run against a scratch database (`npx supabase start` then `npx supabase db push`, or `psql -v ON_ERROR_STOP=1 -f` the file) — Expected: no errors; `\dt` lists all five tables; `select tablename from pg_policies` shows policies on each table
- [ ] **Step 3: Commit** — `git add supabase/migrations/20261003000000_yuran_schema.sql && git commit -m "feat: add yuran schema and RLS policies"`

### Task 3: Supabase clients + auth helpers + login

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/auth.ts`, `middleware.ts`, `app/(auth)/login/page.tsx`
- Test: `tests/auth.test.ts`

**Interfaces:**
- Consumes: `Role`, `Profile` from Task 1
- Produces:
  - `getProfile(): Promise<Profile | null>`
  - `requireRole(roles: Role[]): Promise<Profile>` (throws/redirects when role not in list)
  - `myStudentIds(): Promise<string[]>` (approved links only)
  - `myGroups(): Promise<string[]>` (staff's grup list)
  - `assertRole(profile: Profile | null, roles: Role[]): void` (pure, throws on mismatch — the unit under test)
  - `middleware.ts` redirects unauthenticated users from `/staff`, `/orangtua`, `/admin` to `/login`

- [ ] **Step 1: Write the failing test** — `assertRole` throws for `null` profile and for a role not in the allowed list; does not throw for an allowed role
- [ ] **Step 2: Run test to verify it fails** — Run: `npx vitest run tests/auth.test.ts` — Expected: FAIL
- [ ] **Step 3: Implement** the clients, helpers, middleware, and a minimal Bahasa Indonesia login page (email + password, error message on failure)
- [ ] **Step 4: Run tests to verify they pass** — Run: `npx vitest run tests/auth.test.ts` — Expected: PASS
- [ ] **Step 5: Commit** — `git add lib/supabase lib/auth.ts middleware.ts "app/(auth)/login" tests/auth.test.ts && git commit -m "feat: add auth helpers and login"`

### Task 4: Google Drive integration

**Files:**
- Create: `lib/drive.ts`
- Test: `tests/drive.test.ts`

**Interfaces:**
- Consumes: env `DRIVE_SERVICE_ACCOUNT_JSON`, `DRIVE_FOLDER_ID`
- Produces:
  - `uploadFile(data: Buffer, filename: string, mimeType: string): Promise<string>` — uploads into `DRIVE_FOLDER_ID`, returns the Drive file ID
  - `getViewUrl(fileId: string): string` — returns the shareable view URL for a file ID

- [ ] **Step 1: Write the failing tests** (mock the `googleapis` drive client):
  - `uploadFile` calls `drive.files.create` with the file metadata `parents: [DRIVE_FOLDER_ID]` and returns the created file's id
  - `getViewUrl('abc123')` returns a URL containing `abc123`
- [ ] **Step 2: Run tests to verify they fail** — Run: `npx vitest run tests/drive.test.ts` — Expected: FAIL
- [ ] **Step 3: Implement** `lib/drive.ts` using service-account auth from `DRIVE_SERVICE_ACCOUNT_JSON`
- [ ] **Step 4: Run tests to verify they pass** — Run: `npx vitest run tests/drive.test.ts` — Expected: PASS
- [ ] **Step 5: Manual verification** — with real credentials in `.env.local`, upload one small test file via a scratch script and confirm it appears in the Drive folder; delete it afterwards
- [ ] **Step 6: Commit** — `git add lib/drive.ts tests/drive.test.ts && git commit -m "feat: add Google Drive file storage"`

### Task 5: `recordPayment` server action

**Files:**
- Create: `lib/actions/payments.ts` (the `recordPayment` action; `uploadKwitansi` comes in Task 10)
- Test: `tests/payments-action.test.ts`

**Interfaces:**
- Consumes: `validatePaymentInput` (Task 1), `uploadFile` (Task 4), `getProfile`/`myStudentIds`/`myGroups` (Task 3)
- Produces:
  - `recordPayment(input: { student_id: string; bulan: number; tahun: number; jumlah: number; tanggal_bayar: string; bukti: File; catatan?: string }): Promise<{ ok: true } | { ok: false; error: string }>`
  - Behavior contract: validate input → authorize (orang_tua: student in `myStudentIds()`; staff: student's grup in `myGroups()`; admin: all) → reject duplicate (student, bulan, tahun) with "sudah tercatat" → check file ≤10 MB and image/PDF → `uploadFile` to Drive → insert `payments` row with `bukti_drive_file_id`. If the Drive upload throws, no row is inserted.

- [ ] **Step 1: Write the failing tests** (mock Supabase + Drive):
  - invalid input → `{ ok: false }` and no Drive/DB calls
  - duplicate (student, bulan, tahun) → error contains "sudah tercatat"
  - staff recording for a student outside their grup → error, no insert
  - file >10 MB or `.exe` → rejected before any Drive call
  - Drive `uploadFile` throws → error returned and DB insert never called
  - happy path → Drive called once, insert called once with the returned file ID
- [ ] **Step 2: Run tests to verify they fail** — Run: `npx vitest run tests/payments-action.test.ts` — Expected: FAIL
- [ ] **Step 3: Implement** `recordPayment` in `lib/actions/payments.ts` following the behavior contract exactly
- [ ] **Step 4: Run tests to verify they pass** — Run: `npx vitest run tests/payments-action.test.ts` — Expected: PASS
- [ ] **Step 5: Commit** — `git add lib/actions/payments.ts tests/payments-action.test.ts && git commit -m "feat: add recordPayment server action"`

### Task 6: Staff dashboard UI

**Files:**
- Create: `app/staff/page.tsx` (month/year picker, student list with sudah/belum status, "belum bayar" filter, record-payment form wiring `recordPayment`)

**Interfaces:**
- Consumes: `recordPayment` (Task 5), `paymentStatusFor`/`unpaidStudents` (Task 1), `myGroups` (Task 3)

- [ ] **Step 1: Build the page** — server component fetches the staff's grup students + that month's payments; list shows each student's status via `paymentStatusFor`; filter toggles `unpaidStudents`; form posts to `recordPayment` and shows its error/success message in Bahasa Indonesia
- [ ] **Step 2: Verify the build** — Run: `npm run build` — Expected: compiles with no type errors
- [ ] **Step 3: Manual check** — with seed data, confirm the list, filter, and a recorded payment (with proof upload) behave per spec §5
- [ ] **Step 4: Commit** — `git add app/staff/page.tsx && git commit -m "feat: add staff dashboard"`

### Task 7: Parent registration + approval flow

**Files:**
- Create: `app/(auth)/daftar/page.tsx`; add to `lib/actions/admin.ts`: `registerParent`, `approveParentLink`
- Test: `tests/admin-action.test.ts` (grows in Task 10)

**Interfaces:**
- Consumes: `getProfile` (Task 3)
- Produces:
  - `registerParent(input: { nama: string; email: string; password: string; student_ids: string[] }): Promise<{ ok: true } | { ok: false; error: string }>` — creates auth user + profile + one `parent_students` row per child with `status='pending'`
  - `approveParentLink(linkId: string, approve: boolean): Promise<{ ok: true } | { ok: false; error: string }>` — admin may decide any link; staff only links whose student is in their grup; sets `status` and `approved_by`

- [ ] **Step 1: Write the failing tests** (mocked Supabase):
  - second parent claims an already-approved child → new row stays `pending` (does not auto-approve)
  - staff approving a link for a student outside their grup → error
  - admin approving any link → status becomes `approved` with `approved_by` set
- [ ] **Step 2: Run tests to verify they fail** — Run: `npx vitest run tests/admin-action.test.ts` — Expected: FAIL
- [ ] **Step 3: Implement** the actions and the daftar page (form + student picker; after login with no approved children show "menunggu persetujuan")
- [ ] **Step 4: Run tests to verify they pass** — Run: `npx vitest run tests/admin-action.test.ts` — Expected: PASS
- [ ] **Step 5: Commit** — `git add "app/(auth)/daftar" lib/actions/admin.ts tests/admin-action.test.ts && git commit -m "feat: add parent registration and approval"`

### Task 8: Parent dashboard UI

**Files:**
- Create: `app/orangtua/page.tsx` (children list, per-month status via `paymentStatusFor`, payment detail with proof/kwitansi links via `getViewUrl`, input-payment form reusing `recordPayment`)

**Interfaces:**
- Consumes: `recordPayment` (Task 5), `myStudentIds` (Task 3), `getViewUrl` (Task 4), status helpers (Task 1)

- [ ] **Step 1: Build the page** — shows "menunggu persetujuan" when the parent has no approved children; otherwise per-child month grid, detail view with bukti/kwitansi links, and the input form for unpaid months
- [ ] **Step 2: Verify the build** — Run: `npm run build` — Expected: compiles with no type errors
- [ ] **Step 3: Manual check** — as a parent: pending state, approved state, record a payment, open bukti and kwitansi links
- [ ] **Step 4: Commit** — `git add app/orangtua/page.tsx && git commit -m "feat: add parent dashboard"`

### Task 9: Staff self-assign grup

**Files:**
- Create: `app/staff/grup/page.tsx`; create `lib/actions/staff.ts` with `assignGroups(grups: string[]): Promise<{ ok: true } | { ok: false; error: string }>`

**Interfaces:**
- Consumes: `requireRole` (Task 3)
- Produces: `assignGroups` — replaces the staff's `staff_groups` rows with the chosen grup list (staff role only, no approval needed)

- [ ] **Step 1: Write the failing test** — `assignGroups` as staff writes exactly the chosen grups for their own id; as orang_tua it errors
- [ ] **Step 2: Run test to verify it fails** — Run: `npx vitest run tests/staff-action.test.ts` — Expected: FAIL
- [ ] **Step 3: Implement** the action and the grup-picker page
- [ ] **Step 4: Run tests to verify they pass** — Run: `npx vitest run tests/staff-action.test.ts` — Expected: PASS
- [ ] **Step 5: Commit** — `git add app/staff/grup lib/actions/staff.ts tests/staff-action.test.ts && git commit -m "feat: add staff self-assign grup"`

### Task 10: Admin tab (approvals, assignments, students, accounts, kwitansi)

**Files:**
- Create: `app/admin/page.tsx`; add to `lib/actions/payments.ts`: `uploadKwitansi`; extend `lib/actions/admin.ts`: student CRUD, account management, list helpers

**Interfaces:**
- Consumes: `uploadFile`/`getViewUrl` (Task 4), `requireRole` (Task 3), `approveParentLink` (Task 7)
- Produces:
  - `uploadKwitansi(paymentId: string, file: File): Promise<{ ok: true } | { ok: false; error: string }>` — admin only; uploads to Drive and sets `kwitansi_drive_file_id`
  - Admin tabs: Persetujuan (pending `parent_students` with existing-link context), Penugasan staff (read-only `staff_groups` view), Siswa (CRUD), Akun (create staff/orang_tua, link/unlink), Kwitansi (pick a payment, upload file)

- [ ] **Step 1: Write the failing tests** (extend `tests/admin-action.test.ts`, `tests/payments-action.test.ts`):
  - `uploadKwitansi` as staff/orang_tua → error; as admin → Drive called and update sets `kwitansi_drive_file_id`
- [ ] **Step 2: Run tests to verify they fail** — Expected: FAIL
- [ ] **Step 3: Implement** the actions and the tabbed admin page in Bahasa Indonesia
- [ ] **Step 4: Run tests to verify they pass** — Expected: PASS
- [ ] **Step 5: Commit** — `git add app/admin lib/actions/admin.ts lib/actions/payments.ts tests/ && git commit -m "feat: add admin tab and kwitansi upload"`

### Task 11: Cloudflare Pages deploy configuration

**Files:**
- Create/modify: `next.config.ts` (via `@cloudflare/next-on-pages`), Cloudflare Pages project config, `.env.example` (all required vars documented)

**Interfaces:**
- Consumes: everything above

- [ ] **Step 1: Configure** the `@cloudflare/next-on-pages` adapter and document every env var (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DRIVE_SERVICE_ACCOUNT_JSON`, `DRIVE_FOLDER_ID`) in `.env.example`
- [ ] **Step 2: Verify the edge build** — Run: `npx @cloudflare/next-on-pages` build — Expected: succeeds with no Node-only API errors
- [ ] **Step 3: Deploy to a preview** — Run the Pages deploy for a preview branch — Expected: preview URL serves the login page
- [ ] **Step 4: Commit** — `git add next.config.ts .env.example <pages-config> && git commit -m "chore: configure Cloudflare Pages deploy"`

### Task 12: End-to-end verification pass

**Files:** none new (fixes land in existing files, each with its test)

- [ ] **Step 1: Run the full suite** — Run: `npx vitest run` — Expected: all green
- [ ] **Step 2: Manual pass per spec §7** — as admin, staff, and orang_tua walk every flow in §5 (registration → approval → record → kwitansi → dashboards); log each discrepancy
- [ ] **Step 3: Fix each discrepancy TDD** — failing test first, then fix, then commit per fix
- [ ] **Step 4: Final commit** — `git commit -m "chore: e2e verification fixes"` (only if fixes were needed)
