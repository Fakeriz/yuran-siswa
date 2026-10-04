"use server";

import { createClient } from "../../../lib/supabase/server";
import type { Profile } from "../../../lib/types";

export interface LoginState {
  error: string | null;
  destination: string | null;
}

/**
 * Server Action untuk masuk akun.
 * Mengembalikan objek `{ error, destination }` untuk ditangani oleh sisi klien.
 * Dilarang memicu exception unhandled agar mencegah HTTP 500.
 */
export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  // Validasi awal form input
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    return { error: "Isi alamat email yang valid dan kata sandi.", destination: null };
  }

  try {
    const supabase = await createClient({ readOnly: false });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError || !user) {
      return { error: "Tidak dapat masuk. Periksa email dan kata sandi Anda.", destination: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, nama, peran")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    if (profileError) {
      return { error: "Gagal memuat profil. Silakan coba lagi.", destination: null };
    }

    const emailLower = email.trim().toLowerCase();
    const role: Profile["peran"] =
      profile?.peran ??
      (user.user_metadata?.peran as Profile["peran"]) ??
      (emailLower.includes("admin")
        ? "admin"
        : emailLower.includes("staff")
        ? "staff"
        : "orang_tua");

    // Simpan role ke cookie sesi
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      cookieStore.set("yuran_demo_role", role, {
        path: "/",
        sameSite: "none",
        secure: true,
        maxAge: 60 * 60 * 24 * 7,
      });
      cookieStore.set(
        "yuran_demo_user",
        JSON.stringify({
          nama:
            profile?.nama ??
            (user.user_metadata?.nama as string) ??
            (role === "admin"
              ? "Administrator Demo"
              : role === "staff"
              ? "Staff Demo"
              : "Orang Tua Demo"),
          peran: role,
          email: emailLower,
        }),
        {
          path: "/",
          sameSite: "none",
          secure: true,
          maxAge: 60 * 60 * 24 * 7,
        }
      );
    } catch {
      // Abaikan jika cookie context tidak mengizinkan mutasi
    }

    const destination =
      role === "admin"
        ? "/admin"
        : role === "staff"
        ? "/staff"
        : "/orangtua";

    return { error: null, destination };
  } catch {
    return {
      error: "Layanan masuk belum tersedia. Silakan coba lagi nanti.",
      destination: null,
    };
  }
}

/**
 * Login instan untuk akun demo
 */
export async function loginDemo(role: "admin" | "staff" | "orang_tua"): Promise<string> {
  const email =
    role === "admin" ? "admin@yuran.demo" : role === "staff" ? "staff@yuran.demo" : "ortu@yuran.demo";
  const password =
    role === "admin" ? "admin12345" : role === "staff" ? "staff12345" : "ortu12345";
  const names = {
    admin: "Administrator Demo",
    staff: "Staff Demo",
    orang_tua: "Orang Tua Demo",
  };

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.set("yuran_demo_role", role, {
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set(
      "yuran_demo_user",
      JSON.stringify({
        nama: names[role],
        peran: role,
        email,
      }),
      {
        path: "/",
        sameSite: "none",
        secure: true,
        maxAge: 60 * 60 * 24 * 7,
      }
    );
  } catch {
    // Abaikan jika gagal set cookie
  }

  try {
    const supabase = await createClient({ readOnly: false });
    await supabase.auth.signInWithPassword({ email, password });
  } catch {
    // Fallback demo cookie tetap aktif
  }

  return role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/orangtua";
}

/**
 * Logout pengguna
 */
export async function logout(): Promise<string> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete("yuran_demo_role");
    cookieStore.delete("yuran_demo_user");
  } catch {
    // Abaikan
  }

  try {
    const supabase = await createClient({ readOnly: false });
    await supabase.auth.signOut();
  } catch {
    // Abaikan
  }

  return "/login";
}
