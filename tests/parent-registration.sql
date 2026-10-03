-- Run against a scratch Supabase database after applying both migrations:
-- psql -v ON_ERROR_STOP=1 -f tests/parent-registration.sql
BEGIN;
INSERT INTO public.students(id, nama, grup, kelas, yuran_per_bulan)
VALUES ('00000000-0000-4000-8000-000000000701', 'Test anak', 'Test grup', 'Test kelas', 100);
INSERT INTO auth.users(id, raw_user_meta_data) VALUES
('00000000-0000-4000-8000-000000000702', '{"nama":"Test ibu","student_ids":["00000000-0000-4000-8000-000000000701"]}');
UPDATE public.parent_students SET status = 'approved'
WHERE parent_id = '00000000-0000-4000-8000-000000000702';
INSERT INTO auth.users(id, raw_user_meta_data) VALUES
('00000000-0000-4000-8000-000000000703', '{"nama":"Test ayah","peran":"admin","student_ids":["00000000-0000-4000-8000-000000000701"]}');
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.parent_students
    WHERE parent_id = '00000000-0000-4000-8000-000000000703'
      AND student_id = '00000000-0000-4000-8000-000000000701'
      AND status = 'pending' AND approved_by IS NULL) THEN
    RAISE EXCEPTION 'Second parent must receive a pending link';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.parent_students
    WHERE parent_id = '00000000-0000-4000-8000-000000000702' AND status = 'approved') THEN
    RAISE EXCEPTION 'First parent approval must be preserved';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles
    WHERE id = '00000000-0000-4000-8000-000000000703' AND peran = 'orang_tua') THEN
    RAISE EXCEPTION 'Signup must not accept an elevated role';
  END IF;
END $$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000703', true);
DO $$ BEGIN
  BEGIN
    INSERT INTO public.staff_groups(staff_id, grup)
    VALUES ('00000000-0000-4000-8000-000000000703', 'Test grup');
    RAISE EXCEPTION 'Parent unexpectedly assigned a staff group';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  UPDATE public.parent_students SET status = 'approved', approved_by = auth.uid()
    WHERE parent_id = auth.uid();
  IF FOUND THEN RAISE EXCEPTION 'Parent unexpectedly approved their own link'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
