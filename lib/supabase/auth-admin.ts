import "server-only";
import { createClient } from "@supabase/supabase-js";

// Privileged Auth API only. Application table operations use the admin's RLS session.
export function createAuthAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Konfigurasi administrasi Auth belum tersedia.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }).auth.admin;
}
