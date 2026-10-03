"use server";

import { Buffer } from "node:buffer";
import { getProfile, myGroups, myStudentIds } from "../auth";
import { uploadFile } from "../drive";
import { validatePaymentInput } from "../fees";
import { createClient } from "../supabase/server";

const duplicateMessage = "Pembayaran untuk bulan ini sudah tercatat.";

export async function recordPayment(input: {
  student_id: string;
  bulan: number;
  tahun: number;
  jumlah: number;
  tanggal_bayar: string;
  bukti: File;
  catatan?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const errors = validatePaymentInput(input);
    if (!Number.isInteger(input.tahun) || input.tahun < 2000 || input.tahun > 2100) {
      errors.push("Tahun harus antara 2000 dan 2100.");
    }
    if (errors.length) return { ok: false, error: errors.join(" ") };

    const profile = await getProfile();
    if (!profile) return { ok: false, error: "Silakan masuk terlebih dahulu." };
    if (profile.peran === "orang_tua") {
      if (!(await myStudentIds()).includes(input.student_id)) {
        return { ok: false, error: "Anda tidak memiliki akses ke siswa ini." };
      }
    } else if (profile.peran !== "admin" && profile.peran !== "staff") {
      return { ok: false, error: "Peran Anda tidak diizinkan." };
    }

    const supabase = await createClient({ readOnly: false });
    if (profile.peran === "staff") {
      const { data: student, error } = await supabase.from("students")
        .select("grup").eq("id", input.student_id).maybeSingle();
      if (error || !student || !(await myGroups()).includes(student.grup)) {
        return { ok: false, error: "Anda tidak memiliki akses ke grup siswa ini." };
      }
    }

    const { data: existing, error: lookupError } = await supabase.from("payments")
      .select("id").eq("student_id", input.student_id)
      .eq("bulan", input.bulan).eq("tahun", input.tahun).maybeSingle();
    if (lookupError) return { ok: false, error: "Gagal memeriksa pembayaran. Silakan coba lagi." };
    if (existing) return { ok: false, error: duplicateMessage };

    const file = input.bukti;
    if (!(file instanceof File) || file.size > 10 * 1024 * 1024) {
      return { ok: false, error: "Bukti wajib berupa file berukuran maksimal 10 MB." };
    }
    if ((!file.type.startsWith("image/") && file.type !== "application/pdf") || /\.exe$/i.test(file.name)) {
      return { ok: false, error: "Bukti harus berupa gambar atau PDF." };
    }
    const extension = file.type === "application/pdf" ? "pdf"
      : file.type.slice("image/".length).replace(/[^a-z0-9]/gi, "");
    const filename = `${input.student_id}_${input.tahun}-${String(input.bulan).padStart(2, "0")}_bukti_${crypto.randomUUID()}.${extension}`;
    const fileId = await uploadFile(Buffer.from(await file.arrayBuffer()), filename, file.type);
    const { error: insertError } = await supabase.from("payments").insert({
      student_id: input.student_id,
      bulan: input.bulan,
      tahun: input.tahun,
      jumlah: input.jumlah,
      tanggal_bayar: input.tanggal_bayar,
      bukti_drive_file_id: fileId,
      dicatat_oleh: profile.id,
      catatan: input.catatan ?? null,
    });
    if (insertError) {
      return { ok: false, error: insertError.code === "23505" ? duplicateMessage : "Gagal menyimpan pembayaran." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Pembayaran gagal dicatat. Silakan coba lagi." };
  }
}
