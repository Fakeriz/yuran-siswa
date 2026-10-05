import type { Profile, Role } from "./types";

export function assertRole(profile: Profile | null, roles: Role[]): void {
  if (!profile) throw new Error("Silakan masuk terlebih dahulu.");
  if (!roles.includes(profile.peran)) throw new Error("Anda tidak memiliki izin untuk mengakses halaman ini.");
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const demoRole = cookieStore.get("yuran_demo_role")?.value as Role | undefined;
        if (demoRole && ["admin", "staff", "orang_tua"].includes(demoRole)) {
          return {
            id: demoRole === "admin" ? "73438d4a-77a8-45a2-8079-08c948b6f430"
              : demoRole === "staff" ? "1465af7e-78ab-4919-b2fa-957732ae160b"
              : "26dded92-aa39-48e2-ab09-9dee100a189e",
            nama: demoRole === "admin" ? "Administrator Demo"
              : demoRole === "staff" ? "Staff Demo"
              : "Orang Tua Demo",
            peran: demoRole,
          };
        }
      } catch {
        // cookies() unsupported in this context
      }
      return null;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, nama, peran")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    if (data) return data;

    // Fallback for demo accounts or initial users whose profile row isn't created yet
    const email = user.email?.toLowerCase() ?? "";
    const peran: Role =
      (user.user_metadata?.peran as Role) ??
      (email.includes("admin") ? "admin"
      : email.includes("staff") ? "staff"
      : "orang_tua");

    const nama =
      (user.user_metadata?.nama as string) ??
      (peran === "admin" ? "Administrator Demo"
      : peran === "staff" ? "Staff Demo"
      : "Orang Tua Demo");

    return {
      id: user.id,
      nama,
      peran,
    };
  } catch {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const demoRole = cookieStore.get("yuran_demo_role")?.value as Role | undefined;
      if (demoRole && ["admin", "staff", "orang_tua"].includes(demoRole)) {
        return {
          id: demoRole === "admin" ? "73438d4a-77a8-45a2-8079-08c948b6f430"
            : demoRole === "staff" ? "1465af7e-78ab-4919-b2fa-957732ae160b"
            : "26dded92-aa39-48e2-ab09-9dee100a189e",
          nama: demoRole === "admin" ? "Administrator Demo"
            : demoRole === "staff" ? "Staff Demo"
            : "Orang Tua Demo",
          peran: demoRole,
        };
      }
    } catch {
      // ignore
    }
    return null;
  }
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
  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("parent_students")
      .select("student_id")
      .eq("parent_id", profile.id)
      .eq("status", "approved")
      .returns<{ student_id: string }[]>();

    if (!error && data && data.length > 0) {
      return data.map((link) => link.student_id);
    }
  } catch {
    // Supabase belum dikonfigurasi — pakai demo fallback
  }
  // Demo fallback
  return ["demo-student-1", "demo-student-2"];
}

export async function myGroups(): Promise<string[]> {
  const profile = await requireRole(["staff"]);
  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff_groups")
      .select("grup")
      .eq("staff_id", profile.id)
      .returns<{ grup: string }[]>();

    if (!error && data && data.length > 0) {
      return data.map((group) => group.grup);
    }
  } catch {
    // Supabase belum dikonfigurasi — pakai demo fallback
  }
  // Demo fallback
  return ["Grup A", "Grup B"];
}
