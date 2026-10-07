import type { Profile, Role } from "./types";

export function assertRole(profile: Profile | null, roles: Role[]): void {
  if (!profile) throw new Error("Silakan masuk terlebih dahulu.");
  // Peran admin memiliki izin penuh mengelola seluruh data dan halaman sistem
  if (profile.peran === "admin") return;
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
  const { redirect } = await import("next/navigation");
  if (!profile) {
    return redirect("/login");
  }
  // Admin memiliki hak akses penuh ke seluruh modul sistem
  if (profile.peran === "admin") {
    return profile;
  }
  if (!roles.includes(profile.peran)) {
    // Alihkan ke halaman dashboard yang sesuai daripada error 500
    const destination = profile.peran === "staff" ? "/staff" : "/orangtua";
    return redirect(destination);
  }
  return profile;
}

export async function myStudentIds(): Promise<string[]> {
  try {
    const profile = await getProfile();
    if (!profile) return ["siswa-1", "siswa-2"];
    
    // Jika admin, kembalikan daftar siswa demo/lengkap
    if (profile.peran === "admin") {
      return ["siswa-1", "siswa-2", "siswa-3", "siswa-4", "siswa-5"];
    }

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
  return ["siswa-1", "siswa-2"];
}

export async function myGroups(): Promise<string[]> {
  const ALL_GROUPS = [
    "Adhwa HE",
    "Adnan HE ve Syukri HE",
    "Ameer HE",
    "Arif HE",
    "Azwar HE",
    "Herian HE",
    "Mevlana HE",
    "Razi HE",
    "Rizky HE",
    "Tamimi HE",
  ];

  try {
    const profile = await getProfile();
    // Jika admin atau belum login, berikan seluruh grup
    if (!profile || profile.peran === "admin") {
      return ALL_GROUPS;
    }

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
  return ALL_GROUPS;
}
