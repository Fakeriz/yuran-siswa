import Link from "next/link";
import { myGroups } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { GroupForm } from "./group-form";
import { LayoutDashboard, UsersRound } from "lucide-react";
import { UserBar } from "../../../components/user-bar";
import { GlowBackground } from "../../../components/glow-background";

export const metadata = { title: "Pilih grup | YuranKu" };

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
    groups = ["Grup A", "Grup B", "Grup C", "Grup D"];
  }

  return (
    <div className="relative min-h-dvh flex flex-col bg-[#f7f9fc] text-slate-900 dark:bg-[#0b1329] dark:text-slate-100 [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-blue-600">
      <GlowBackground />
      <UserBar userRole="staff" userName="Staff Demo" title="YuranKu · Dashboard Staf" />
      <div className="relative flex-1 md:grid md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 p-6 dark:border-slate-800 md:border-r md:border-b-0">
          <p className="px-3 text-xs font-medium text-slate-400 dark:text-slate-500">Menu</p>
          <nav aria-label="Menu staf" className="mt-2 space-y-0.5">
            <Link href="/staff" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100">
              <LayoutDashboard className="size-[18px] shrink-0 text-slate-400 dark:text-slate-500" aria-hidden />
              Dashboard Staf
            </Link>
            <Link href="/staff/grup" aria-current="page" className="flex items-center gap-3 rounded-xl bg-violet-100/80 px-3 py-2.5 text-sm font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              <UsersRound className="size-[18px] shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
              Pilih Grup
            </Link>
          </nav>
        </aside>
        <main className="w-full max-w-2xl px-6 py-8 md:p-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Pilih grup</h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">Pilih grup anak didik Anda. Pilihan langsung berlaku setelah disimpan, tanpa persetujuan admin.</p>
          <GroupForm groups={groups} initialSelected={selected} />
        </main>
      </div>
    </div>
  );
}
