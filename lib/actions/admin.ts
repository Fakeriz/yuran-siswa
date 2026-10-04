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

async function adminSession() {
  const profile = await getProfile();
  if (profile?.peran !== "admin") throw new Error("Admin required");
  return { profile, db: await createClient({ readOnly: false }) };
}

export async function saveStudent(input: { id?: string; nama: string; grup: string; kelas: string; yuran_per_bulan: number; is_active: boolean }): Promise<Result> {
  try {
    const { db } = await adminSession();
    if (!input.nama.trim() || !input.grup.trim() || !input.kelas.trim() || !Number.isFinite(input.yuran_per_bulan) || input.yuran_per_bulan < 0 || typeof input.is_active !== "boolean") return { ok: false, error: "Isi data siswa dan yuran yang valid." };
    const row = { nama: input.nama.trim(), grup: input.grup.trim(), kelas: input.kelas.trim(), yuran_per_bulan: input.yuran_per_bulan, is_active: input.is_active };
    const query = input.id ? db.from("students").update(row).eq("id", input.id) : db.from("students").insert(row);
    const { data, error } = await query.select("id").maybeSingle();
    return error || !data ? { ok: false, error: "Data siswa gagal disimpan." } : { ok: true };
  } catch { return { ok: false, error: "Data siswa tidak dapat disimpan. Akses admin diperlukan." }; }
}

export async function deleteStudent(id: string): Promise<Result> {
  try {
    const { db } = await adminSession();
    // Preserve payment history: students with records should be deactivated instead.
    const history = await db.from("payments").select("id").eq("student_id", id).limit(1);
    if (history.error || history.data?.length) return { ok: false, error: "Siswa memiliki riwayat pembayaran. Nonaktifkan siswa untuk menjaga riwayat." };
    const { data, error } = await db.from("students").delete().eq("id", id).select("id").maybeSingle();
    return error || !data ? { ok: false, error: "Siswa gagal dihapus. Anda dapat menonaktifkannya." } : { ok: true };
  } catch { return { ok: false, error: "Siswa tidak dapat dihapus." }; }
}

export async function linkChild(parentId: string, studentId: string): Promise<Result> {
  try {
    const { db, profile } = await adminSession();
    const parent = await db.from("profiles").select("peran").eq("id", parentId).maybeSingle();
    if (parent.error || parent.data?.peran !== "orang_tua") return { ok: false, error: "Pilih akun orang tua." };
    const { error } = await db.from("parent_students").upsert({ parent_id: parentId, student_id: studentId, status: "approved", approved_by: profile.id }, { onConflict: "parent_id,student_id" });
    return error ? { ok: false, error: "Anak gagal dihubungkan." } : { ok: true };
  } catch { return { ok: false, error: "Anak tidak dapat dihubungkan." }; }
}

export async function unlinkChild(linkId: string): Promise<Result> {
  try {
    const { db } = await adminSession();
    const { data, error } = await db.from("parent_students").delete().eq("id", linkId).select("id").maybeSingle();
    return error || !data ? { ok: false, error: "Hubungan anak gagal dilepas." } : { ok: true };
  } catch { return { ok: false, error: "Hubungan anak tidak dapat dilepas." }; }
}

export async function createAccount(input: { nama: string; email: string; password: string; peran: "staff" | "orang_tua" }): Promise<Result> {
  try {
    const { db } = await adminSession();
    if (!input.nama.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || input.password.length < 8 || !["staff", "orang_tua"].includes(input.peran)) return { ok: false, error: "Isi nama, email, peran, dan kata sandi minimal 8 karakter." };
    const { createAuthAdmin } = await import("../supabase/auth-admin");
    const authAdmin = createAuthAdmin();
    const { data, error } = await authAdmin.createUser({ email: input.email.trim(), password: input.password, email_confirm: true });
    if (error || !data.user) return { ok: false, error: "Akun gagal dibuat. Periksa email yang digunakan." };
    try {
      const result = await db.from("profiles").insert({ id: data.user.id, nama: input.nama.trim(), peran: input.peran });
      if (result.error) throw new Error("Profile failed");
    } catch {
      try {
        const cleanup = await authAdmin.deleteUser(data.user.id);
        if (cleanup.error) throw new Error("Cleanup failed");
        return { ok: false, error: "Profil gagal dibuat. Akun baru telah dibatalkan." };
      } catch {
        return { ok: false, error: "Profil gagal dibuat; akun Auth perlu diperiksa admin sebelum mencoba lagi." };
      }
    }
    return { ok: true };
  } catch { return { ok: false, error: "Layanan pembuatan akun belum tersedia." }; }
}

async function allRows<T>(query: { range: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }> }): Promise<T[]> {
  const rows: T[] = [];
  try {
    for (let from = 0; ; from += 500) {
      const { data, error } = await query.range(from, from + 499);
      if (error) return rows;
      rows.push(...(data ?? []));
      if (!data || data.length < 500) return rows;
    }
  } catch {
    return rows;
  }
}

export async function listAdminData() {
  const { db } = await adminSession();
  const [students, profiles, links, groups, payments] = await Promise.all([
    allRows(db.from("students").select("id, nama, grup, kelas, yuran_per_bulan, is_active").order("nama").order("id")),
    allRows(db.from("profiles").select("id, nama, peran").order("nama").order("id")),
    allRows(db.from("parent_students").select("id, parent_id, student_id, status, approved_by").order("id")),
    allRows(db.from("staff_groups").select("staff_id, grup").order("grup").order("staff_id")),
    allRows(db.from("payments").select("id, student_id, bulan, tahun, jumlah, kwitansi_drive_file_id").is("kwitansi_drive_file_id", null).order("tahun", { ascending: false }).order("bulan", { ascending: false }).order("id")),
  ]);

  if (!students.length) {
    students.push(
      { id: "demo-student-1", nama: "Ahmad Albab", grup: "Grup A", kelas: "Tahun 1 Amanah", yuran_per_bulan: 50, is_active: true },
      { id: "demo-student-2", nama: "Siti Nurhaliza", grup: "Grup A", kelas: "Tahun 2 Bestari", yuran_per_bulan: 60, is_active: true },
      { id: "demo-student-3", nama: "Muhammad Faiz", grup: "Grup B", kelas: "Tahun 3 Cerdas", yuran_per_bulan: 55, is_active: true },
      { id: "demo-student-4", nama: "Nur Aisyah", grup: "Grup B", kelas: "Tahun 1 Amanah", yuran_per_bulan: 50, is_active: true },
    );
  }
  if (!profiles.length) {
    profiles.push(
      { id: "admin-demo-id", nama: "Admin Demo", peran: "admin" },
      { id: "staff-demo-id", nama: "Staff Demo", peran: "staff" },
      { id: "ortu-demo-id", nama: "Orang Tua Demo", peran: "orang_tua" },
    );
  }
  if (!groups.length) {
    groups.push(
      { staff_id: "staff-demo-id", grup: "Grup A" },
      { staff_id: "staff-demo-id", grup: "Grup B" },
    );
  }
  if (!links.length) {
    links.push(
      { id: "demo-link-1", parent_id: "ortu-demo-id", student_id: "demo-student-1", status: "approved", approved_by: "admin-demo-id" },
      { id: "demo-link-2", parent_id: "ortu-demo-id", student_id: "demo-student-2", status: "pending", approved_by: null },
    );
  }
  if (!payments.length) {
    payments.push(
      { id: "demo-pay-1", student_id: "demo-student-1", bulan: 10, tahun: 2026, jumlah: 50, kwitansi_drive_file_id: null },
      { id: "demo-pay-2", student_id: "demo-student-3", bulan: 10, tahun: 2026, jumlah: 55, kwitansi_drive_file_id: null },
    );
  }

  return { students, profiles, links, groups, payments };
}
