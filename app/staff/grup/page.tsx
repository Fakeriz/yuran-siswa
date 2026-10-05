import Link from "next/link";
import { myGroups } from "../../../lib/auth";
import { createClient } from "../../../lib/supabase/server";
import { GroupForm } from "./group-form";
import { UserBar } from "../../../components/user-bar";
import { GlowBackground } from "../../../components/glow-background";

export const metadata = { title: "Pilih grup | Yuran Siswa" };

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
      <UserBar userRole="staff" userName="Staff Demo" title="Yuran Siswa · Dashboard Staf" />
      <div className="relative flex-1 md:grid md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 p-6 dark:border-slate-800 md:border-r md:border-b-0">
          <p className="text-lg font-semibold">Menu Staf</p>
          <nav aria-label="Menu staf" className="mt-6 space-y-2">
            <Link href="/staff" className="block rounded-2xl px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-900">Dashboard staf</Link>
            <Link href="/staff/grup" aria-current="page" className="block rounded-2xl bg-blue-600/10 px-4 py-3 font-semibold text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">Pilih grup</Link>
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
