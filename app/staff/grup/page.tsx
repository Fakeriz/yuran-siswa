import { myGroups } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { GroupForm } from "./group-form";
import { REAL_STUDENTS } from "../../../lib/data/real-data";

export const metadata = { title: "Pilih grup | YuranKu" };

// 10 grup HE asli dari data spreadsheet
const GRUP_ASLI = [...new Set(REAL_STUDENTS.map((s) => s.grup))].sort();

export default async function GroupPage() {
  const selected = await myGroups();
  let groups: string[] = [];
  try {
    const db = await createClient();
    const { data, error } = await db.rpc("available_staff_groups");
    if (!error && Array.isArray(data) && data.length > 0) {
      groups = data.map((row: { grup: string }) => row.grup);
    }
  } catch {
    // fallback
  }

  if (!groups.length) {
    groups = GRUP_ASLI;
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Pilih grup</h1>
      <p className="mt-3 text-muted-foreground">Pilih grup siswa Anda. Pilihan langsung berlaku setelah disimpan, tanpa persetujuan admin.</p>
      <GroupForm groups={groups} initialSelected={selected} />
    </div>
  );
}
