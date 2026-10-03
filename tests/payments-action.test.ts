import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getProfile: vi.fn(), myStudentIds: vi.fn(), myGroups: vi.fn(),
  createClient: vi.fn(), from: vi.fn(), uploadFile: vi.fn(), insert: vi.fn(),
  student: vi.fn(), duplicate: vi.fn(), studentEq: vi.fn(), paymentEq: vi.fn(),
  events: [] as string[],
}));
vi.mock("../lib/auth", () => ({ getProfile: mocks.getProfile, myStudentIds: mocks.myStudentIds, myGroups: mocks.myGroups }));
vi.mock("../lib/drive", () => ({ uploadFile: mocks.uploadFile }));
vi.mock("../lib/supabase/server", () => ({ createClient: mocks.createClient }));

import { recordPayment } from "../lib/actions/payments";

const valid = () => ({
  student_id: "student-1", bulan: 10, tahun: 2026, jumlah: 100,
  tanggal_bayar: "2026-10-03", bukti: new File(["%PDF-1.7\nproof"], "bukti.pdf", { type: "application/pdf" }),
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.events.length = 0;
  mocks.getProfile.mockImplementation(async () => {
    mocks.events.push("authorize");
    return { id: "admin-1", nama: "Admin", peran: "admin" };
  });
  mocks.myStudentIds.mockResolvedValue(["student-1"]);
  mocks.myGroups.mockResolvedValue(["A"]);
  const studentQuery = { eq: mocks.studentEq, maybeSingle: mocks.student };
  const paymentQuery = { eq: mocks.paymentEq, maybeSingle: mocks.duplicate };
  mocks.studentEq.mockReturnValue(studentQuery);
  mocks.paymentEq.mockReturnValue(paymentQuery);
  mocks.student.mockResolvedValue({ data: { grup: "A" }, error: null });
  mocks.duplicate.mockImplementation(async () => {
    mocks.events.push("duplicate");
    return { data: null, error: null };
  });
  mocks.insert.mockImplementation(async () => { mocks.events.push("insert"); return { error: null }; });
  mocks.from.mockImplementation((table: string) => {
    if (table === "students") return { select: () => studentQuery };
    if (table === "payments") return { select: () => paymentQuery, insert: mocks.insert };
    throw new Error(`Unexpected table ${table}`);
  });
  mocks.createClient.mockResolvedValue({ from: mocks.from });
  mocks.uploadFile.mockImplementation(async () => { mocks.events.push("upload"); return "drive-proof-123"; });
});

describe("recordPayment", () => {
  it.each([{ bulan: 0 }, { jumlah: 0 }, { student_id: "" }, { tanggal_bayar: "invalid" }])("rejects invalid input %j before auth, DB, or Drive", async (change) => {
    expect(await recordPayment({ ...valid(), ...change })).toMatchObject({ ok: false });
    expect(mocks.getProfile).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.uploadFile).not.toHaveBeenCalled();
  });

  it.each([1999, 2101, 2026.5])("rejects a year outside the database contract: %s", async (tahun) => {
    expect(await recordPayment({ ...valid(), tahun })).toMatchObject({ ok: false });
    expect(mocks.getProfile).not.toHaveBeenCalled();
    expect(mocks.uploadFile).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated user before querying payments", async () => {
    mocks.getProfile.mockResolvedValue(null);
    expect(await recordPayment(valid())).toMatchObject({ ok: false });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.uploadFile).not.toHaveBeenCalled();
  });

  it("rejects a parent without an approved link", async () => {
    mocks.getProfile.mockResolvedValue({ id: "parent-1", nama: "Orang tua", peran: "orang_tua" });
    mocks.myStudentIds.mockResolvedValue(["other-child"]);
    expect(await recordPayment(valid())).toMatchObject({ ok: false });
    expect(mocks.duplicate).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.uploadFile).not.toHaveBeenCalled();
  });

  it("allows a parent with an approved link", async () => {
    mocks.getProfile.mockResolvedValue({ id: "parent-1", nama: "Orang tua", peran: "orang_tua" });
    expect(await recordPayment(valid())).toEqual({ ok: true });
    expect(mocks.myStudentIds).toHaveBeenCalledOnce();
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ dicatat_oleh: "parent-1" }));
  });

  it("rejects staff outside the student's group before duplicate checks or upload", async () => {
    mocks.getProfile.mockResolvedValue({ id: "staff-1", nama: "Staf", peran: "staff" });
    mocks.myGroups.mockResolvedValue(["B"]);
    expect(await recordPayment(valid())).toMatchObject({ ok: false });
    expect(mocks.studentEq).toHaveBeenCalledWith("id", "student-1");
    expect(mocks.duplicate).not.toHaveBeenCalled();
    expect(mocks.uploadFile).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("allows staff assigned to the student's group", async () => {
    mocks.getProfile.mockResolvedValue({ id: "staff-1", nama: "Staf", peran: "staff" });
    expect(await recordPayment(valid())).toEqual({ ok: true });
    expect(mocks.myGroups).toHaveBeenCalledOnce();
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ dicatat_oleh: "staff-1" }));
  });

  it.each([
    { data: null, error: null },
    { data: null, error: { message: "DB failed" } },
  ])("fails closed when the student's group cannot be read", async (result) => {
    mocks.getProfile.mockResolvedValue({ id: "staff-1", nama: "Staf", peran: "staff" });
    mocks.student.mockResolvedValue(result);
    expect(await recordPayment(valid())).toMatchObject({ ok: false });
    expect(mocks.uploadFile).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("rejects duplicates for the exact student/month/year before file validation", async () => {
    mocks.duplicate.mockResolvedValue({ data: { id: "existing-payment" }, error: null });
    const result = await recordPayment({ ...valid(), bukti: new File(["MZ"], "bad.exe", { type: "application/octet-stream" }) });
    expect(result).toEqual({ ok: false, error: expect.stringContaining("sudah tercatat") });
    expect(mocks.paymentEq.mock.calls).toEqual([["student_id", "student-1"], ["bulan", 10], ["tahun", 2026]]);
    expect(mocks.uploadFile).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("does not upload when the duplicate query fails", async () => {
    mocks.duplicate.mockResolvedValue({ data: null, error: { message: "DB failed" } });
    expect(await recordPayment(valid())).toMatchObject({ ok: false });
    expect(mocks.uploadFile).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("rejects proof larger than 10 MB before upload", async () => {
    const bukti = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.pdf", { type: "application/pdf" });
    expect(await recordPayment({ ...valid(), bukti })).toMatchObject({ ok: false });
    expect(mocks.duplicate).toHaveBeenCalledOnce();
    expect(mocks.uploadFile).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("accepts proof exactly 10 MB", async () => {
    const bukti = new File([new Uint8Array(10 * 1024 * 1024)], "large.pdf", { type: "application/pdf" });
    expect(await recordPayment({ ...valid(), bukti })).toEqual({ ok: true });
  });

  it.each([
    ["program.exe", "application/x-msdownload"],
    ["program.exe", "image/png"],
    ["note.txt", "text/plain"],
  ])("rejects unsupported proof %s (%s) before upload", async (name, type) => {
    expect(await recordPayment({ ...valid(), bukti: new File(["test"], name, { type }) })).toMatchObject({ ok: false });
    expect(mocks.uploadFile).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("accepts image proof", async () => {
    expect(await recordPayment({ ...valid(), bukti: new File(["image"], "bukti.png", { type: "image/png" }) })).toEqual({ ok: true });
    expect(mocks.uploadFile).toHaveBeenCalledWith(expect.anything(), expect.stringMatching(/\.png$/), "image/png");
  });

  it("returns an error without insert when Drive upload throws", async () => {
    mocks.uploadFile.mockRejectedValue(new Error("Drive unavailable"));
    expect(await recordPayment(valid())).toMatchObject({ ok: false });
    expect(mocks.uploadFile).toHaveBeenCalledOnce();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("uploads once before inserting the Drive ID and server-owned recorder", async () => {
    const input = { ...valid(), catatan: "Transfer", dicatat_oleh: "forged", kwitansi_drive_file_id: "forged" };
    expect(await recordPayment(input)).toEqual({ ok: true });
    expect(mocks.events).toEqual(["authorize", "duplicate", "upload", "insert"]);
    expect(mocks.uploadFile).toHaveBeenCalledOnce();
    const [bytes, name, mime] = mocks.uploadFile.mock.calls[0];
    expect(bytes.toString()).toBe("%PDF-1.7\nproof");
    expect(name).toMatch(/^student-1_2026-10_bukti_[a-f0-9-]+\.pdf$/);
    expect(mime).toBe("application/pdf");
    expect(mocks.insert).toHaveBeenCalledExactlyOnceWith({
      student_id: "student-1", bulan: 10, tahun: 2026, jumlah: 100, tanggal_bayar: "2026-10-03",
      bukti_drive_file_id: "drive-proof-123", dicatat_oleh: "admin-1", catatan: "Transfer",
    });
  });

  it("returns a duplicate error if a concurrent insert wins the unique constraint", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "23505", message: "duplicate" } });
    expect(await recordPayment(valid())).toEqual({ ok: false, error: expect.stringContaining("sudah tercatat") });
  });

  it("returns an error when inserting the payment fails", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "42501", message: "RLS denied" } });
    expect(await recordPayment(valid())).toMatchObject({ ok: false });
    expect(mocks.insert).toHaveBeenCalledOnce();
  });
});

describe("uploadKwitansi", () => {
  it.each(["staff", "orang_tua"])("denies %s before Drive or DB", async (peran) => {
    mocks.getProfile.mockResolvedValue({ id: "user", peran });
    const { uploadKwitansi } = await import("../lib/actions/payments");
    expect(await uploadKwitansi("payment", valid().bukti)).toMatchObject({ ok: false });
    expect(mocks.uploadFile).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("admin uploads once and updates only the chosen payment receipt", async () => {
    const update = vi.fn();
    const chain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { id: "payment", student_id: "student-1", bulan: 10, tahun: 2026 }, error: null }), update };
    update.mockReturnValue(chain);
    mocks.from.mockReturnValue(chain);
    const { uploadKwitansi } = await import("../lib/actions/payments");
    expect(await uploadKwitansi("payment", valid().bukti)).toEqual({ ok: true });
    expect(mocks.uploadFile).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledExactlyOnceWith({ kwitansi_drive_file_id: "drive-proof-123" });
    expect(chain.eq).toHaveBeenCalledWith("id", "payment");
  });
  it("never updates a receipt when upload fails", async () => {
    const update = vi.fn();
    const chain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { id: "payment" }, error: null }), update };
    mocks.from.mockReturnValue(chain);
    mocks.uploadFile.mockRejectedValue(new Error("offline"));
    const { uploadKwitansi } = await import("../lib/actions/payments");
    expect(await uploadKwitansi("payment", valid().bukti)).toMatchObject({ ok: false });
    expect(update).not.toHaveBeenCalled();
  });
});
