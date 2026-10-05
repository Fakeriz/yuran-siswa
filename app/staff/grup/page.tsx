import Link from "next/link";
import { myGroups } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { GroupForm } from "./group-form";
import { LayoutDashboard, UsersRound } from "lucide-react";
import { UserBar } from "../../../components/user-bar";
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
    <div className="relative min-h-dvh flex flex-col bg-background text-foreground [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-primary">
      <UserBar userRole="staff" userName="Staff Demo" title="YuranKu · Dashboard Staf" />
      <div className="relative flex-1 md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 md:p-6">
        <aside className="border-b border-border bg-card p-4 md:rounded-2xl md:border md:p-4">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Menu</p>
          <nav aria-label="Menu staf" className="mt-2 space-y-1">
            <Link href="/staff" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <LayoutDashboard className="size-[18px] shrink-0" aria-hidden />
              Dashboard Staf
            </Link>
            <Link href="/staff/grup" aria-current="page" className="flex items-center gap-3 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm">
              <UsersRound className="size-[18px] shrink-0" aria-hidden />
              Pilih Grup
            </Link>
          </nav>
        </aside>
        <main className="w-full max-w-2xl px-6 py-8 md:rounded-2xl md:border md:border-border md:bg-card md:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pilih grup</h1>
          <p className="mt-3 text-muted-foreground">Pilih grup siswa Anda. Pilihan langsung berlaku setelah disimpan, tanpa persetujuan admin.</p>
          <GroupForm groups={groups} initialSelected={selected} />
        </main>
      </div>
    </div>
  );
}
