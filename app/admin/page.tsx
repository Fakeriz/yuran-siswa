import { requireRole } from "../../lib/auth";
import { listAdminData } from "../../lib/actions/admin";
import { AdminPanel } from "./panel";

export const metadata = { title: "Administrasi | Yuran Siswa" };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireRole(["admin"]);
  const { tab } = await searchParams;
  const data = await listAdminData();
  return <AdminPanel initialTab={tab} data={data} />;
}

