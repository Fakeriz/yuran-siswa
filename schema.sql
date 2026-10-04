-- ============================================================================
-- SCHEMA DATABASE: YuranKu (Aplikasi Pencatat Yuran Bulanan Siswa)
-- Stack: Supabase (PostgreSQL 15+ & RLS & Auth)
--
-- Aturan Bisnis & Arsitektur Utama:
-- 1. Penyimpanan Bukti & Kwitansi: HANYA via Google Drive API (hanya simpan file ID di DB).
--    Supabase Storage TIDAK digunakan.
-- 2. Satu pembayaran per (student_id, bulan, tahun).
-- 3. Kwitansi (kwitansi_drive_file_id) hanya boleh ditulis/diubah oleh peran 'admin'.
-- 4. public.current_role() bertipe SECURITY DEFINER untuk mencegah rekursi RLS.
-- 5. Peran Pengguna (user_role): 'admin', 'staff', 'orang_tua'.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------------
-- 1. ENUM TYPES
-- --------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'staff', 'orang_tua');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE link_status AS ENUM ('pending', 'approved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- --------------------------------------------------------------------------
-- 2. PROFIL PENGGUNA (1:1 dengan auth.users)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  peran user_role NOT NULL DEFAULT 'orang_tua',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------------
-- 3. DATA SISWA (Talebe)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  grup TEXT NOT NULL,
  kelas TEXT NOT NULL,
  yuran_per_bulan NUMERIC(10,2) NOT NULL CHECK (yuran_per_bulan >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_grup ON public.students(grup);
CREATE INDEX IF NOT EXISTS idx_students_active ON public.students(is_active);

-- --------------------------------------------------------------------------
-- 4. RELASI ORANG TUA <-> SISWA (Persetujuan / Approval)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status link_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE (parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_students_parent ON public.parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student ON public.parent_students(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_status ON public.parent_students(status);

-- --------------------------------------------------------------------------
-- 5. PENUGASAN GRUP STAF (Dipilih sendiri oleh staf, langsung aktif)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_groups (
  staff_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  grup TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (staff_id, grup)
);

CREATE INDEX IF NOT EXISTS idx_staff_groups_staff ON public.staff_groups(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_groups_grup ON public.staff_groups(grup);

-- --------------------------------------------------------------------------
-- 6. PEMBAYARAN YURAN (Satu baris per siswa, bulan, tahun)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun INT NOT NULL CHECK (tahun BETWEEN 2000 AND 2100),
  jumlah NUMERIC(10,2) NOT NULL CHECK (jumlah > 0),
  tanggal_bayar DATE NOT NULL DEFAULT CURRENT_DATE,
  bukti_drive_file_id TEXT NOT NULL,
  kwitansi_drive_file_id TEXT, -- Hanya ditulis/diupload oleh admin
  dicatat_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, bulan, tahun)
);

CREATE INDEX IF NOT EXISTS idx_payments_student_period ON public.payments(student_id, tahun, bulan);
CREATE INDEX IF NOT EXISTS idx_payments_period ON public.payments(tahun, bulan);

-- ============================================================================
-- FUNGSI & HELPER KEAMANAN (SECURITY DEFINER)
-- ============================================================================

-- Helper: Peran pengguna saat ini.
-- WAJIB SECURITY DEFINER untuk mencegah rekursi policy pada tabel profiles.
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT peran FROM public.profiles WHERE id = auth.uid()
$$;

-- Helper: Memeriksa apakah siswa berada di dalam grup penugasan staf saat ini.
CREATE OR REPLACE FUNCTION public.is_staff_student(child_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_role() = 'staff' AND EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.staff_groups sg ON sg.grup = s.grup
    WHERE s.id = child_id AND sg.staff_id = auth.uid()
  )
$$;

REVOKE ALL ON FUNCTION public.is_staff_student(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff_student(UUID) TO authenticated;

-- Helper: Mengambil daftar siswa aktif untuk form registrasi orang tua.
CREATE OR REPLACE FUNCTION public.registration_students()
RETURNS TABLE (id UUID, nama TEXT, kelas TEXT)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, nama, kelas FROM public.students WHERE is_active ORDER BY nama
$$;

REVOKE ALL ON FUNCTION public.registration_students() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registration_students() TO anon, authenticated;

-- Helper: Mengambil daftar grup asrama yang tersedia untuk dipilih staf.
CREATE OR REPLACE FUNCTION public.available_staff_groups()
RETURNS TABLE (grup TEXT)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT s.grup FROM public.students s
  WHERE public.current_role() = 'staff'
  UNION
  SELECT sg.grup FROM public.staff_groups sg
  WHERE sg.staff_id = auth.uid() AND public.current_role() = 'staff'
  ORDER BY grup
$$;

REVOKE ALL ON FUNCTION public.available_staff_groups() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.available_staff_groups() TO authenticated;

-- Prosedur: Staf memilih / memperbarui penugasan grup asrama mereka sendiri.
CREATE OR REPLACE FUNCTION public.assign_staff_groups(selected_groups TEXT[])
RETURNS VOID
LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.current_role() IS DISTINCT FROM 'staff' THEN
    RAISE EXCEPTION 'Hanya staf yang diizinkan memilih grup' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::TEXT, 0));

  IF selected_groups IS NULL OR EXISTS (
    SELECT 1 FROM unnest(selected_groups) AS choice(grup)
    WHERE choice.grup IS NULL OR trim(choice.grup) = '' OR NOT EXISTS (
      SELECT 1 FROM public.available_staff_groups() available WHERE available.grup = choice.grup
    )
  ) THEN
    RAISE EXCEPTION 'Pilihan grup tidak valid';
  END IF;

  DELETE FROM public.staff_groups WHERE staff_id = auth.uid();
  INSERT INTO public.staff_groups(staff_id, grup)
    SELECT auth.uid(), choice.grup FROM (SELECT DISTINCT unnest(selected_groups) AS grup) choice;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_staff_groups(TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_staff_groups(TEXT[]) TO authenticated;

-- Trigger: Pembuatan profil dan klaim anak otomatis saat Orang Tua mendaftar via auth.users.
CREATE OR REPLACE FUNCTION public.create_parent_registration()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  child_id UUID;
BEGIN
  IF NOT (NEW.raw_user_meta_data ? 'student_ids') THEN
    RETURN NEW;
  END IF;

  IF jsonb_typeof(NEW.raw_user_meta_data->'student_ids') <> 'array'
     OR jsonb_array_length(NEW.raw_user_meta_data->'student_ids') = 0
     OR coalesce(trim(NEW.raw_user_meta_data->>'nama'), '') = '' THEN
    RAISE EXCEPTION 'Pendaftaran orang tua tidak valid';
  END IF;

  INSERT INTO public.profiles(id, nama, peran)
    VALUES (NEW.id, trim(NEW.raw_user_meta_data->>'nama'), 'orang_tua');

  FOR child_id IN SELECT DISTINCT value::UUID FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'student_ids') LOOP
    IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = child_id AND is_active) THEN
      RAISE EXCEPTION 'Siswa yang dipilih tidak aktif atau tidak ditemukan';
    END IF;
    INSERT INTO public.parent_students(parent_id, student_id, status, approved_by)
      VALUES (NEW.id, child_id, 'pending', NULL);
  END LOOP;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.create_parent_registration() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_parent_signup ON auth.users;
CREATE TRIGGER on_parent_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_parent_registration();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- Tabel: profiles
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin kelola semua profil" ON public.profiles;
CREATE POLICY "Admin kelola semua profil"
  ON public.profiles FOR ALL
  USING (public.current_role() = 'admin');

DROP POLICY IF EXISTS "User lihat profil sendiri" ON public.profiles;
CREATE POLICY "User lihat profil sendiri"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "User daftar: buat profil sendiri" ON public.profiles;
CREATE POLICY "User daftar: buat profil sendiri"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid() AND peran = 'orang_tua');

-- --------------------------------------------------------------------------
-- Tabel: students
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin kelola siswa" ON public.students;
CREATE POLICY "Admin kelola siswa"
  ON public.students FOR ALL
  USING (public.current_role() = 'admin');

DROP POLICY IF EXISTS "Staff lihat anak didiknya" ON public.students;
CREATE POLICY "Staff lihat anak didiknya"
  ON public.students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_groups sg
      WHERE sg.staff_id = auth.uid() AND sg.grup = students.grup
    )
  );

DROP POLICY IF EXISTS "Ortu lihat anaknya (approved)" ON public.students;
CREATE POLICY "Ortu lihat anaknya (approved)"
  ON public.students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.parent_id = auth.uid()
        AND ps.student_id = students.id
        AND ps.status = 'approved'
    )
  );

-- --------------------------------------------------------------------------
-- Tabel: parent_students
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin kelola relasi" ON public.parent_students;
CREATE POLICY "Admin kelola relasi"
  ON public.parent_students FOR ALL
  USING (public.current_role() = 'admin');

DROP POLICY IF EXISTS "Ortu lihat pengajuannya" ON public.parent_students;
CREATE POLICY "Ortu lihat pengajuannya"
  ON public.parent_students FOR SELECT
  USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "Staff lihat klaim grupnya" ON public.parent_students;
CREATE POLICY "Staff lihat klaim grupnya"
  ON public.parent_students FOR SELECT
  TO authenticated
  USING (public.is_staff_student(student_id));

DROP POLICY IF EXISTS "Ortu ajukan klaim anak" ON public.parent_students;
CREATE POLICY "Ortu ajukan klaim anak"
  ON public.parent_students FOR INSERT
  WITH CHECK (
    parent_id = auth.uid()
    AND status = 'pending'
    AND approved_by IS NULL
  );

DROP POLICY IF EXISTS "Staff setujui klaim grupnya" ON public.parent_students;
CREATE POLICY "Staff setujui klaim grupnya"
  ON public.parent_students FOR UPDATE
  USING (public.is_staff_student(student_id))
  WITH CHECK (
    public.is_staff_student(student_id)
    AND approved_by = auth.uid()
    AND status IN ('pending', 'approved')
  );

-- --------------------------------------------------------------------------
-- Tabel: staff_groups
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin lihat penugasan" ON public.staff_groups;
CREATE POLICY "Admin lihat penugasan"
  ON public.staff_groups FOR SELECT
  USING (public.current_role() = 'admin');

DROP POLICY IF EXISTS "Staff kelola grupnya sendiri" ON public.staff_groups;
CREATE POLICY "Staff kelola grupnya sendiri"
  ON public.staff_groups FOR ALL
  USING (
    staff_id = auth.uid()
    AND public.current_role() = 'staff'
  )
  WITH CHECK (
    staff_id = auth.uid()
    AND public.current_role() = 'staff'
  );

-- --------------------------------------------------------------------------
-- Tabel: payments
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin kelola pembayaran" ON public.payments;
CREATE POLICY "Admin kelola pembayaran"
  ON public.payments FOR ALL
  USING (public.current_role() = 'admin');

DROP POLICY IF EXISTS "Ortu lihat pembayaran anaknya" ON public.payments;
CREATE POLICY "Ortu lihat pembayaran anaknya"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.parent_id = auth.uid()
        AND ps.student_id = payments.student_id
        AND ps.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Staff lihat pembayaran anak didiknya" ON public.payments;
CREATE POLICY "Staff lihat pembayaran anak didiknya"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.staff_groups sg ON sg.grup = s.grup
      WHERE s.id = payments.student_id
        AND sg.staff_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Ortu catat bayar anaknya" ON public.payments;
CREATE POLICY "Ortu catat bayar anaknya"
  ON public.payments FOR INSERT
  WITH CHECK (
    dicatat_oleh = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.parent_id = auth.uid()
        AND ps.student_id = payments.student_id
        AND ps.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Staff catat bayar anak didiknya" ON public.payments;
CREATE POLICY "Staff catat bayar anak didiknya"
  ON public.payments FOR INSERT
  WITH CHECK (
    dicatat_oleh = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.staff_groups sg ON sg.grup = s.grup
      WHERE s.id = payments.student_id
        AND sg.staff_id = auth.uid()
    )
  );
