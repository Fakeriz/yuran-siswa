import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ client: vi.fn(), signIn: vi.fn(), from: vi.fn(), eq: vi.fn(), single: vi.fn(), getProfile: vi.fn() }));
vi.mock("../lib/supabase/server", () => ({ createClient: m.client }));
vi.mock("../lib/auth", () => ({ getProfile: m.getProfile }));
import { login } from "../app/(auth)/login/actions";
const input = () => { const form = new FormData(); form.set("email", " user@example.com "); form.set("password", "password"); return form; };
const initial = { error: null, destination: null };
beforeEach(() => {
  vi.resetAllMocks();
  m.signIn.mockResolvedValue({ data: { user: { id: "signed-in-user" } }, error: null });
  m.single.mockResolvedValue({ data: { id: "signed-in-user", nama: "User", peran: "staff" }, error: null });
  m.eq.mockReturnValue({ maybeSingle: m.single });
  m.from.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: m.eq }) });
  m.client.mockResolvedValue({ auth: { signInWithPassword: m.signIn }, from: m.from });
  m.getProfile.mockRejectedValue(new Error("Second client must not be used"));
});
it.each([["staff", "/staff"], ["admin", "/admin"], ["orang_tua", "/orangtua"], [null, "/orangtua"]])("returns destination %s for role", async (peran, destination) => {
  m.single.mockResolvedValue({ data: peran ? { peran } : null, error: null });
  expect(await login(initial, input())).toEqual({ error: null, destination });
  expect(m.client).toHaveBeenCalledExactlyOnceWith({ readOnly: false });
  expect(m.from).toHaveBeenCalledWith("profiles");
  expect(m.eq).toHaveBeenCalledWith("id", "signed-in-user");
  expect(m.getProfile).not.toHaveBeenCalled();
});
it("returns a profile query error instead of throwing", async () => {
  m.single.mockResolvedValue({ data: null, error: { message: "query failed" } });
  expect(await login(initial, input())).toEqual({ error: "Gagal memuat profil. Silakan coba lagi.", destination: null });
});
it.each(["client", "signIn", "single"] as const)("catches failures in %s", async (step) => {
  m[step].mockRejectedValue(new Error("network"));
  expect(await login(initial, input())).toEqual({ error: "Layanan masuk belum tersedia. Silakan coba lagi nanti.", destination: null });
});
it.each([{ data: { user: null }, error: null }, { data: { user: null }, error: { message: "invalid" } }])("rejects unsuccessful signin", async (result) => {
  m.signIn.mockResolvedValue(result);
  expect(await login(initial, input())).toEqual({ error: "Tidak dapat masuk. Periksa email dan kata sandi Anda.", destination: null });
  expect(m.from).not.toHaveBeenCalled();
});
it("rejects invalid form before creating a client", async () => {
  expect(await login(initial, new FormData())).toMatchObject({ error: expect.any(String), destination: null });
  expect(m.client).not.toHaveBeenCalled();
});
