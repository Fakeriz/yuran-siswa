export function getServerConfig(): { url: string; key: string } {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    "https://pmywxrjwoinomdsyvcyc.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBteXd4cmp3b2lub21kc3l2Y3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNTE2MTMsImV4cCI6MjEwNjYyNzYxM30.AAJZjqW3tB2Vi039dsk5nywOgD97tRnv2sIijUk5XAI";

  if (!url || !key) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }

  return { url, key };
}
