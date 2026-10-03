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
