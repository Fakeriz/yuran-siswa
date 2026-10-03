import Link from "next/link";
import { requireRole } from "../../lib/auth";
import { listAdminData } from "../../lib/actions/admin";
import { AdminPanel } from "./panel";

export const metadata = { title: "Administrasi | Yuran Siswa" };
const tabs = [["persetujuan", "Persetujuan"], ["penugasan", "Penugasan staff"], ["siswa", "Siswa"], ["akun", "Akun"], ["kwitansi", "Kwitansi"]] as const;
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireRole(["admin"]);
  const { tab } = await searchParams;
  const active = tabs.find(([id]) => id === tab)?.[0] ?? "persetujuan";
  const data = await listAdminData();
  return <div className="min-h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 md:grid md:grid-cols-[220px_minmax(0,1fr)] [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-emerald-700">
    <aside className="border-b border-zinc-200 p-6 dark:border-zinc-800 md:border-r md:border-b-0"><p className="text-lg font-semibold">Yuran Siswa</p><nav aria-label="Tab administrasi" className="mt-6 flex flex-wrap gap-2 md:flex-col">{tabs.map(([id, title]) => <Link key={id} href={`/admin?tab=${id}`} aria-current={active === id ? "page" : undefined} className={`rounded-2xl px-4 py-3 text-sm ${active === id ? "bg-emerald-800 font-medium text-white" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}>{title}</Link>)}</nav></aside>
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-8 sm:px-8 md:py-12"><p className="text-sm text-zinc-600 dark:text-zinc-400">Administrasi</p><h1 className="mt-2 text-3xl font-semibold">{tabs.find(([id]) => id === active)?.[1]}</h1><AdminPanel key={active} tab={active} data={data} /></main>
  </div>;
}
