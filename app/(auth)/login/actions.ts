"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

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

  try {
    const supabase = await createClient({ readOnly: false });
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: "Tidak dapat masuk. Periksa email dan kata sandi Anda." };
  } catch {
    return { error: "Layanan masuk belum tersedia. Silakan coba lagi nanti." };
  }

  redirect("/");
}
