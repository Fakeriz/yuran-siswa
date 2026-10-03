import type { Profile, Role } from "./types";

export function assertRole(profile: Profile | null, roles: Role[]): void {
  if (!profile) throw new Error("Silakan masuk terlebih dahulu.");
  if (!roles.includes(profile.peran)) throw new Error("Anda tidak memiliki izin untuk mengakses halaman ini.");
}

export async function getProfile(): Promise<Profile | null> {
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nama, peran")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (error) throw new Error("Profil tidak dapat dimuat.");
  return data;
}

export async function requireRole(roles: Role[]): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    const { redirect } = await import("next/navigation");
    return redirect("/login");
  }
  assertRole(profile, roles);
  return profile;
}

export async function myStudentIds(): Promise<string[]> {
  const profile = await requireRole(["orang_tua"]);
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parent_students")
    .select("student_id")
    .eq("parent_id", profile.id)
    .eq("status", "approved")
    .returns<{ student_id: string }[]>();

  if (error) throw new Error("Daftar anak tidak dapat dimuat.");
  return (data ?? []).map((link) => link.student_id);
}

export async function myGroups(): Promise<string[]> {
  const profile = await requireRole(["staff"]);
  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff_groups")
    .select("grup")
    .eq("staff_id", profile.id)
    .returns<{ grup: string }[]>();

  if (error) throw new Error("Daftar grup tidak dapat dimuat.");
  return (data ?? []).map((group) => group.grup);
}
