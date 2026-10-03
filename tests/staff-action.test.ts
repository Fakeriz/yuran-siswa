import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ role: vi.fn(), client: vi.fn(), rpc: vi.fn() }));
vi.mock("../lib/auth", () => ({ requireRole: m.role }));
vi.mock("../lib/supabase/server", () => ({ createClient: m.client }));
import { assignGroups } from "../lib/actions/staff";
beforeEach(() => {
  vi.resetAllMocks();
  m.role.mockResolvedValue({ id: "staff-1", peran: "staff" });
  m.client.mockResolvedValue({ rpc: m.rpc });
  m.rpc.mockResolvedValue({ error: null });
});
it("staff replaces exactly selected groups using the authenticated identity", async () => {
  expect(await assignGroups(["A", "B"])).toEqual({ ok: true });
  expect(m.role).toHaveBeenCalledWith(["staff"]);
  // The RPC derives staff_id from auth.uid(), never from caller input.
  expect(m.rpc).toHaveBeenCalledExactlyOnceWith("assign_staff_groups", { selected_groups: ["A", "B"] });
});
it("denies parents without any database mutation", async () => {
  m.role.mockRejectedValue(new Error("Peran orang_tua tidak diizinkan"));
  expect(await assignGroups(["A"])).toMatchObject({ ok: false });
  expect(m.client).not.toHaveBeenCalled();
});
it("allows clearing all groups", async () => {
  expect(await assignGroups([])).toEqual({ ok: true });
  expect(m.rpc).toHaveBeenCalledWith("assign_staff_groups", { selected_groups: [] });
});
it("deduplicates groups while preserving their exact names", async () => {
  await assignGroups([" A ", " A "]);
  expect(m.rpc).toHaveBeenCalledWith("assign_staff_groups", { selected_groups: [" A "] });
});
it("rejects blank group names", async () => {
  expect(await assignGroups([" "])).toMatchObject({ ok: false });
  expect(m.rpc).not.toHaveBeenCalled();
});
it("reports a failed transaction", async () => {
  m.rpc.mockResolvedValue({ error: { message: "failed" } });
  expect(await assignGroups(["A"])).toMatchObject({ ok: false });
});
