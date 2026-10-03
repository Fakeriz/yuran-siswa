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
