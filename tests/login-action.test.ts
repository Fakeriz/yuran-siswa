import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ client: vi.fn(), signIn: vi.fn(), from: vi.fn(), eq: vi.fn(), single: vi.fn(), redirect: vi.fn(), getProfile: vi.fn() }));
vi.mock("../lib/supabase/server", () => ({ createClient: m.client }));
vi.mock("../lib/auth", () => ({ getProfile: m.getProfile }));
vi.mock("next/navigation", () => ({ redirect: m.redirect }));
import { login } from "../app/(auth)/login/actions";
const input = () => { const form = new FormData(); form.set("email", " user@example.com "); form.set("password", "password"); return form; };
beforeEach(() => {
  vi.resetAllMocks();
  m.signIn.mockResolvedValue({ data: { user: { id: "signed-in-user" } }, error: null });
  m.single.mockResolvedValue({ data: { id: "signed-in-user", nama: "User", peran: "staff" }, error: null });
  m.eq.mockReturnValue({ maybeSingle: m.single });
  m.from.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: m.eq }) });
  m.client.mockResolvedValue({ auth: { signInWithPassword: m.signIn }, from: m.from });
  m.getProfile.mockRejectedValue(new Error("Second client must not be used"));
  m.redirect.mockImplementation((path) => { throw new Error(`NEXT_REDIRECT:${path}`); });
});
it.each([["staff", "/staff"], ["admin", "/admin"], ["orang_tua", "/orangtua"], [null, "/"]])("routes %s without catching redirect", async (peran, destination) => {
  m.single.mockResolvedValue({ data: peran ? { peran } : null, error: null });
  await expect(login({ error: null }, input())).rejects.toThrow(`NEXT_REDIRECT:${destination}`);
  expect(m.client).toHaveBeenCalledExactlyOnceWith({ readOnly: false });
  expect(m.from).toHaveBeenCalledWith("profiles");
  expect(m.eq).toHaveBeenCalledWith("id", "signed-in-user");
  expect(m.getProfile).not.toHaveBeenCalled();
});
it("returns a profile query error instead of throwing", async () => {
  m.single.mockResolvedValue({ data: null, error: { message: "query failed" } });
  expect(await login({ error: null }, input())).toEqual({ error: "Gagal memuat profil. Silakan coba lagi." });
  expect(m.redirect).not.toHaveBeenCalled();
});
it.each(["client", "signIn", "single"] as const)("catches failures in %s", async (step) => {
  m[step].mockRejectedValue(new Error("network"));
  expect(await login({ error: null }, input())).toEqual({ error: "Layanan masuk belum tersedia. Silakan coba lagi nanti." });
  expect(m.redirect).not.toHaveBeenCalled();
});
it.each([{ data: { user: null }, error: null }, { data: { user: null }, error: { message: "invalid" } }])("rejects unsuccessful signin", async (result) => {
  m.signIn.mockResolvedValue(result);
  expect(await login({ error: null }, input())).toEqual({ error: "Tidak dapat masuk. Periksa email dan kata sandi Anda." });
  expect(m.from).not.toHaveBeenCalled();
});
it("rejects invalid form before creating a client", async () => {
  expect(await login({ error: null }, new FormData())).toMatchObject({ error: expect.any(String) });
  expect(m.client).not.toHaveBeenCalled();
});
