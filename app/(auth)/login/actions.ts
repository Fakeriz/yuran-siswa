"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import type { Profile } from "../../../lib/types";

export interface LoginState {
  error: string | null;
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" || password.length === 0) {
    return { error: "Isi alamat email yang valid dan kata sandi." };
  }

  let destination: string;
  try {
    const supabase = await createClient({ readOnly: false });
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !user) return { error: "Tidak dapat masuk. Periksa email dan kata sandi Anda." };

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, nama, peran")
      .eq("id", user.id)
      .maybeSingle<Profile>();
    if (profileError) return { error: "Gagal memuat profil. Silakan coba lagi." };

    const emailLower = email.trim().toLowerCase();
    const role: Profile["peran"] =
      profile?.peran ??
      (user.user_metadata?.peran as Profile["peran"]) ??
      (emailLower.includes("admin") ? "admin"
      : emailLower.includes("staff") ? "staff"
      : "orang_tua");

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
          nama: profile?.nama ?? (user.user_metadata?.nama as string) ?? (role === "admin" ? "Administrator Demo" : role === "staff" ? "Staff Demo" : "Orang Tua Demo"),
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
      // ignore
    }

    destination =
      role === "orang_tua" ? "/orangtua"
      : role === "admin" ? "/admin"
      : role === "staff" ? "/staff"
      : "/";
  } catch {
    return { error: "Layanan masuk belum tersedia. Silakan coba lagi nanti." };
  }

  redirect(destination);
}

export async function loginDemo(role: "admin" | "staff" | "orang_tua"): Promise<void> {
  const email = role === "admin" ? "admin@yuran.demo" : role === "staff" ? "staff@yuran.demo" : "ortu@yuran.demo";
  const password = role === "admin" ? "admin12345" : role === "staff" ? "staff12345" : "ortu12345";
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
    // ignore
  }

  try {
    const supabase = await createClient({ readOnly: false });
    await supabase.auth.signInWithPassword({ email, password });
  } catch {
    // Demo cookie guarantees session even if network auth fails
  }

  const destination = role === "admin" ? "/admin" : role === "staff" ? "/staff" : "/orangtua";
  redirect(destination);
}

export async function logout(): Promise<void> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete("yuran_demo_role");
    cookieStore.delete("yuran_demo_user");
  } catch {
    // ignore
  }

  try {
    const supabase = await createClient({ readOnly: false });
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  redirect("/login");
}
