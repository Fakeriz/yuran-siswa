import { describe, expect, it } from "vitest";
import { assertRole } from "../lib/auth";
import type { Profile, Role } from "../lib/types";

const profile: Profile = { id: "user-1", nama: "Pengguna", peran: "staff" };

describe("assertRole", () => {
  it("rejects an unauthenticated user", () => {
    expect(() => assertRole(null, ["admin", "staff", "orang_tua"])).toThrow();
  });

  it("rejects a role outside the allowed list", () => {
    expect(() => assertRole(profile, ["admin", "orang_tua"])).toThrow();
  });

  it("rejects an empty allowed-role list", () => {
    expect(() => assertRole(profile, [])).toThrow();
  });

  it.each<Role>(["admin", "staff", "orang_tua"])("allows the matching role %s", (peran) => {
    expect(() => assertRole({ ...profile, peran }, [peran])).not.toThrow();
  });

  it("accepts a role anywhere in the allowed list without changing the profile", () => {
    const original = { ...profile };
    expect(() => assertRole(profile, ["admin", "staff"])).not.toThrow();
    expect(profile).toEqual(original);
  });
});
