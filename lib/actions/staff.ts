"use server";

import { requireRole } from "../auth";
import { createClient } from "../supabase/server";

export async function assignGroups(grups: string[]): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireRole(["staff"]);
    if (!Array.isArray(grups) || grups.some((grup) => typeof grup !== "string" || !grup.trim())) {
      return { ok: false, error: "Pilihan grup tidak valid." };
    }
    const db = await createClient({ readOnly: false });
    const { error } = await db.rpc("assign_staff_groups", { selected_groups: [...new Set(grups)] });
    if (error) return { ok: false, error: "Grup gagal disimpan. Muat ulang daftar lalu coba lagi." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Grup tidak dapat disimpan. Pastikan Anda masuk sebagai staf." };
  }
}
