import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ client: vi.fn(), profile: vi.fn(), groups: vi.fn(), signup: vi.fn(), from: vi.fn(), rpc: vi.fn(), update: vi.fn(), single: vi.fn(), eq: vi.fn() }));
vi.mock("../lib/supabase/server", () => ({ createClient: m.client }));
vi.mock("../lib/auth", () => ({ getProfile: m.profile, myGroups: m.groups }));
import { approveParentLink, registerParent } from "../lib/actions/admin";
beforeEach(() => {
  vi.resetAllMocks();
  m.profile.mockResolvedValue({ id: "admin", peran: "admin" });
  m.groups.mockResolvedValue(["A"]);
  m.signup.mockResolvedValue({ data: { user: { id: "parent-2", identities: [{ id: "identity" }] } }, error: null });
  const chain = { select: vi.fn().mockReturnThis(), eq: m.eq, maybeSingle: m.single };
  m.eq.mockReturnValue(chain);
  m.single.mockResolvedValue({ data: { id: "link", student_id: "child", grup: "B" }, error: null });
  m.update.mockReturnValue(chain);
  m.from.mockReturnValue({ ...chain, update: m.update });
  m.rpc.mockResolvedValue({ data: [{ id: "child" }], error: null });
  m.client.mockResolvedValue({ auth: { signUp: m.signup }, from: m.from, rpc: m.rpc });
});
it("second parent claims an already-approved child through a new pending registration", async () => {
  expect(await registerParent({ nama: "Ibu", email: "ibu@example.com", password: "password123", student_ids: ["child"] })).toEqual({ ok: true });
  expect(m.signup).toHaveBeenCalledWith(expect.objectContaining({ options: { data: { nama: "Ibu", student_ids: ["child"] } } }));
  // The auth trigger creates independent pending rows; no existing parent link is reused.
  expect(m.update).not.toHaveBeenCalled();
});
it("staff cannot approve a student outside their group", async () => {
  m.profile.mockResolvedValue({ id: "staff", peran: "staff" });
  expect(await approveParentLink("link", true)).toMatchObject({ ok: false });
  expect(m.update).not.toHaveBeenCalled();
});
it("admin approves a link with their server-owned ID", async () => {
  expect(await approveParentLink("link", true)).toEqual({ ok: true });
  expect(m.update).toHaveBeenCalledWith({ status: "approved", approved_by: "admin" });
});
it("staff can approve their own group", async () => {
  m.profile.mockResolvedValue({ id: "staff", peran: "staff" });
  m.groups.mockResolvedValue(["B"]);
  expect(await approveParentLink("link", true)).toEqual({ ok: true });
});
it("reject keeps the schema-supported pending status and records the reviewer", async () => {
  expect(await approveParentLink("link", false)).toEqual({ ok: true });
  expect(m.update).toHaveBeenCalledWith({ status: "pending", approved_by: "admin" });
});
it.each([null, { id: "parent", peran: "orang_tua" }])("denies unauthorized approval", async (profile) => {
  m.profile.mockResolvedValue(profile);
  expect(await approveParentLink("link", true)).toMatchObject({ ok: false });
  expect(m.update).not.toHaveBeenCalled();
});
it("rejects invalid registration before signup", async () => {
  expect(await registerParent({ nama: "", email: "bad", password: "x", student_ids: [] })).toMatchObject({ ok: false });
  expect(m.signup).not.toHaveBeenCalled();
});
it("returns an error when signup or its atomic trigger fails", async () => {
  m.signup.mockResolvedValue({ data: { user: null }, error: { message: "trigger failed" } });
  expect(await registerParent({ nama: "Ibu", email: "ibu@example.com", password: "password123", student_ids: ["child"] })).toMatchObject({ ok: false });
});
it("does not claim success when an approval updates no row", async () => {
  m.single.mockResolvedValueOnce({ data: { student_id: "child" }, error: null }).mockResolvedValueOnce({ data: null, error: null });
  expect(await approveParentLink("link", true)).toMatchObject({ ok: false });
});
