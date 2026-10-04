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

    destination =
      profile?.peran === "orang_tua" ? "/orangtua"
      : profile?.peran === "admin" ? "/admin"
      : profile?.peran === "staff" ? "/staff"
      : "/";
  } catch {
    return { error: "Layanan masuk belum tersedia. Silakan coba lagi nanti." };
  }

  redirect(destination);
}
