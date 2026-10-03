"use server";

import { getProfile, myGroups } from "../auth";
import { createClient } from "../supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function registerParent(input: { nama: string; email: string; password: string; student_ids: string[] }): Promise<Result> {
  try {
    if (!input.nama.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || input.password.length < 8 ||
        !Array.isArray(input.student_ids) || !input.student_ids.length || input.student_ids.some((id) => typeof id !== "string" || !id.trim())) {
      return { ok: false, error: "Isi nama, email yang valid, kata sandi minimal 8 karakter, dan pilih anak." };
    }
    const db = await createClient({ readOnly: false });
    const { data, error } = await db.auth.signUp({
      email: input.email.trim(), password: input.password,
      options: { data: { nama: input.nama.trim(), student_ids: [...new Set(input.student_ids)] } },
    });
    // The auth trigger creates the profile and pending links in the signup transaction.
    if (error || !data.user || data.user.identities?.length === 0) {
      return { ok: false, error: "Pendaftaran gagal. Periksa data atau masuk jika email sudah terdaftar." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Layanan pendaftaran belum tersedia. Silakan coba lagi." };
  }
}

export async function approveParentLink(linkId: string, approve: boolean): Promise<Result> {
  try {
    const profile = await getProfile();
    if (!profile || !["admin", "staff"].includes(profile.peran) || !linkId || typeof approve !== "boolean") {
      return { ok: false, error: "Anda tidak memiliki izin untuk memutuskan pengajuan ini." };
    }
    const db = await createClient({ readOnly: false });
    const { data: link, error } = await db.from("parent_students").select("student_id").eq("id", linkId).maybeSingle();
    if (error || !link) return { ok: false, error: "Pengajuan tidak ditemukan atau tidak dapat diakses." };
    if (profile.peran === "staff") {
      const { data: student, error } = await db.from("students").select("grup").eq("id", link.student_id).maybeSingle();
      if (error || !student || !(await myGroups()).includes(student.grup)) {
        return { ok: false, error: "Siswa ini berada di luar grup Anda." };
      }
    }
    const { data: updated, error: updateError } = await db.from("parent_students")
      .update({ status: approve ? "approved" : "pending", approved_by: profile.id })
      .eq("id", linkId).select("id").maybeSingle();
    if (updateError || !updated) return { ok: false, error: "Pengajuan gagal diperbarui." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Pengajuan gagal diperbarui. Silakan coba lagi." };
  }
}
