-- ============================================================================
-- SCHEMA DATABASE: Aplikasi Pencatat Yuran Bulanan Siswa
-- Selaras dengan spec revisi 2 (2026-10-03)
--
-- Keputusan penting:
-- * File bukti & kwitansi disimpan di Google Drive (hanya file ID di DB).
--   Supabase Storage TIDAK dipakai.
-- * Satu baris payments per (siswa, bulan, tahun); status bayar dihitung
--   dari ada/tidaknya baris (tidak ada alur verifikasi pembayaran).
-- * Kwitansi hanya ditulis oleh admin.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------------
-- 1. Enum
-- --------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'orang_tua');
CREATE TYPE link_status AS ENUM ('pending', 'approved');

-- --------------------------------------------------------------------------
-- 2. Profil pengguna (1:1 dengan auth.users)
-- --------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  peran user_role NOT NULL DEFAULT 'orang_tua',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------------
-- 3. Data siswa
-- --------------------------------------------------------------------------
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  grup TEXT NOT NULL,
  kelas TEXT NOT NULL,
  yuran_per_bulan NUMERIC(10,2) NOT NULL CHECK (yuran_per_bulan >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------------
-- 4. Relasi orang tua <-> anak (pengajuan dapat berstatus pending)
-- --------------------------------------------------------------------------
CREATE TABLE parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status link_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (parent_id, student_id)
);
CREATE INDEX idx_parent_students_student ON parent_students(student_id);
CREATE INDEX idx_parent_students_status ON parent_students(status);

-- --------------------------------------------------------------------------
-- 5. Penugasan grup oleh staff (dipilih sendiri, langsung aktif)
-- --------------------------------------------------------------------------
CREATE TABLE staff_groups (
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  grup TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (staff_id, grup)
);

-- --------------------------------------------------------------------------
-- 6. Pembayaran: satu baris per (siswa, bulan, tahun)
-- --------------------------------------------------------------------------
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun INT NOT NULL CHECK (tahun BETWEEN 2000 AND 2100),
  jumlah NUMERIC(10,2) NOT NULL CHECK (jumlah > 0),
  tanggal_bayar DATE NOT NULL DEFAULT CURRENT_DATE,
  bukti_drive_file_id TEXT NOT NULL,
  kwitansi_drive_file_id TEXT, -- hanya diisi oleh admin, belakangan
  dicatat_oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, bulan, tahun)
);
CREATE INDEX idx_payments_student_period ON payments(student_id, tahun, bulan);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Helper: peran user saat ini. SECURITY DEFINER agar tidak rekursi RLS
-- saat dipanggil dari dalam policy tabel profiles itu sendiri.
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$ SELECT peran FROM profiles WHERE id = auth.uid() $$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- profiles
-- --------------------------------------------------------------------------
CREATE POLICY "Admin kelola semua profil"
  ON profiles FOR ALL USING (public.current_role() = 'admin');

CREATE POLICY "User lihat profil sendiri"
  ON profiles FOR SELECT USING (id = auth.uid());

-- Dipakai tepat setelah signUp (user sudah terautentikasi).
CREATE POLICY "User daftar: buat profil sendiri"
  ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- --------------------------------------------------------------------------
-- students
-- --------------------------------------------------------------------------
CREATE POLICY "Admin kelola siswa"
  ON students FOR ALL USING (public.current_role() = 'admin');

CREATE POLICY "Staff lihat anak didiknya"
  ON students FOR SELECT USING (
    EXISTS (SELECT 1 FROM staff_groups sg
            WHERE sg.staff_id = auth.uid() AND sg.grup = students.grup)
  );

CREATE POLICY "Ortu lihat anaknya (approved)"
  ON students FOR SELECT USING (
    EXISTS (SELECT 1 FROM parent_students ps
            WHERE ps.parent_id = auth.uid()
              AND ps.student_id = students.id
              AND ps.status = 'approved')
  );

-- --------------------------------------------------------------------------
-- parent_students
-- --------------------------------------------------------------------------
CREATE POLICY "Admin kelola relasi"
  ON parent_students FOR ALL USING (public.current_role() = 'admin');

CREATE POLICY "Ortu lihat pengajuannya"
  ON parent_students FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Ortu ajukan klaim anak"
  ON parent_students FOR INSERT
  WITH CHECK (parent_id = auth.uid() AND status = 'pending');

-- Staff menyetujui klaim untuk anak didiknya. Kode aplikasi hanya mengubah
-- kolom status/approved_by; policy ini membatasi baris yang boleh diubah.
CREATE POLICY "Staff setujui klaim grupnya"
  ON parent_students FOR UPDATE
  USING (
    EXISTS (SELECT 1
            FROM students s
            JOIN staff_groups sg ON sg.grup = s.grup
            WHERE s.id = parent_students.student_id
              AND sg.staff_id = auth.uid())
  )
  WITH CHECK (status IN ('pending', 'approved'));

-- --------------------------------------------------------------------------
-- staff_groups
-- --------------------------------------------------------------------------
CREATE POLICY "Admin lihat penugasan"
  ON staff_groups FOR SELECT USING (public.current_role() = 'admin');

CREATE POLICY "Staff kelola grupnya sendiri"
  ON staff_groups FOR ALL
  USING (staff_id = auth.uid())
  WITH CHECK (staff_id = auth.uid());

-- --------------------------------------------------------------------------
-- payments
-- --------------------------------------------------------------------------
CREATE POLICY "Admin kelola pembayaran"
  ON payments FOR ALL USING (public.current_role() = 'admin');

CREATE POLICY "Ortu lihat pembayaran anaknya"
  ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM parent_students ps
            WHERE ps.parent_id = auth.uid()
              AND ps.student_id = payments.student_id
              AND ps.status = 'approved')
  );

CREATE POLICY "Staff lihat pembayaran anak didiknya"
  ON payments FOR SELECT USING (
    EXISTS (SELECT 1
            FROM students s
            JOIN staff_groups sg ON sg.grup = s.grup
            WHERE s.id = payments.student_id
              AND sg.staff_id = auth.uid())
  );

CREATE POLICY "Ortu catat bayar anaknya"
  ON payments FOR INSERT WITH CHECK (
    dicatat_oleh = auth.uid()
    AND EXISTS (SELECT 1 FROM parent_students ps
                WHERE ps.parent_id = auth.uid()
                  AND ps.student_id = payments.student_id
                  AND ps.status = 'approved')
  );

CREATE POLICY "Staff catat bayar anak didiknya"
  ON payments FOR INSERT WITH CHECK (
    dicatat_oleh = auth.uid()
    AND EXISTS (SELECT 1
                FROM students s
                JOIN staff_groups sg ON sg.grup = s.grup
                WHERE s.id = payments.student_id
                  AND sg.staff_id = auth.uid())
  );

-- Tidak ada policy UPDATE/DELETE selain admin: hanya admin yang boleh
-- mengisi kwitansi_drive_file_id atau mengubah/menghapus pembayaran.

-- Only expose the identity fields needed to choose a child at registration.
CREATE FUNCTION public.registration_students()
RETURNS TABLE (id UUID, nama TEXT, kelas TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT id, nama, kelas FROM public.students WHERE is_active ORDER BY nama $$;
REVOKE ALL ON FUNCTION public.registration_students() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registration_students() TO anon, authenticated;

CREATE FUNCTION public.create_parent_registration()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE child_id UUID;
BEGIN
  IF NOT (NEW.raw_user_meta_data ? 'student_ids') THEN RETURN NEW; END IF;
  IF jsonb_typeof(NEW.raw_user_meta_data->'student_ids') <> 'array'
     OR jsonb_array_length(NEW.raw_user_meta_data->'student_ids') = 0
     OR coalesce(trim(NEW.raw_user_meta_data->>'nama'), '') = '' THEN
    RAISE EXCEPTION 'Invalid parent registration';
  END IF;
  INSERT INTO public.profiles(id, nama, peran)
    VALUES (NEW.id, trim(NEW.raw_user_meta_data->>'nama'), 'orang_tua');
  FOR child_id IN SELECT DISTINCT value::UUID FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'student_ids') LOOP
    IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = child_id AND is_active) THEN
      RAISE EXCEPTION 'Student unavailable';
    END IF;
    INSERT INTO public.parent_students(parent_id, student_id, status, approved_by)
      VALUES (NEW.id, child_id, 'pending', NULL);
  END LOOP;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.create_parent_registration() FROM PUBLIC;
CREATE TRIGGER on_parent_signup AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_parent_registration();

CREATE FUNCTION public.is_staff_student(child_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.current_role() = 'staff' AND EXISTS (
  SELECT 1 FROM public.students s JOIN public.staff_groups sg ON sg.grup = s.grup
  WHERE s.id = child_id AND sg.staff_id = auth.uid()
) $$;
REVOKE ALL ON FUNCTION public.is_staff_student(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff_student(UUID) TO authenticated;
CREATE POLICY "Staff lihat klaim grupnya" ON public.parent_students FOR SELECT TO authenticated
USING (public.is_staff_student(student_id));

-- A caller cannot create an elevated profile or pre-approve their own claim.
DROP POLICY "User daftar: buat profil sendiri" ON public.profiles;
CREATE POLICY "User daftar: buat profil sendiri" ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid() AND peran = 'orang_tua');
DROP POLICY "Ortu ajukan klaim anak" ON public.parent_students;
CREATE POLICY "Ortu ajukan klaim anak" ON public.parent_students FOR INSERT
WITH CHECK (parent_id = auth.uid() AND status = 'pending' AND approved_by IS NULL);

DROP POLICY "Staff kelola grupnya sendiri" ON public.staff_groups;
CREATE POLICY "Staff kelola grupnya sendiri" ON public.staff_groups FOR ALL
USING (staff_id = auth.uid() AND public.current_role() = 'staff')
WITH CHECK (staff_id = auth.uid() AND public.current_role() = 'staff');
DROP POLICY "Staff setujui klaim grupnya" ON public.parent_students;
CREATE POLICY "Staff setujui klaim grupnya" ON public.parent_students FOR UPDATE
USING (public.is_staff_student(student_id))
WITH CHECK (public.is_staff_student(student_id) AND approved_by = auth.uid() AND status IN ('pending', 'approved'));
-- Staff need to see group names before they have any assignments.
CREATE FUNCTION public.available_staff_groups()
RETURNS TABLE (grup TEXT) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
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

CREATE FUNCTION public.assign_staff_groups(selected_groups TEXT[])
RETURNS VOID LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.current_role() IS DISTINCT FROM 'staff' THEN
    RAISE EXCEPTION 'Staff role required' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::TEXT, 0));
  IF selected_groups IS NULL OR EXISTS (
    SELECT 1 FROM unnest(selected_groups) AS choice(grup)
    WHERE choice.grup IS NULL OR trim(choice.grup) = '' OR NOT EXISTS (
      SELECT 1 FROM public.available_staff_groups() available WHERE available.grup = choice.grup
    )
  ) THEN RAISE EXCEPTION 'Invalid group selection'; END IF;
  DELETE FROM public.staff_groups WHERE staff_id = auth.uid();
  INSERT INTO public.staff_groups(staff_id, grup)
    SELECT auth.uid(), choice.grup FROM (SELECT DISTINCT unnest(selected_groups) AS grup) choice;
END;
$$;
REVOKE ALL ON FUNCTION public.assign_staff_groups(TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_staff_groups(TEXT[]) TO authenticated;
