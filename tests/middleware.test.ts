import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { CookieMethodsServer } from "@supabase/ssr";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), cookies: undefined as CookieMethodsServer | undefined }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (_url: string, _key: string, options: { cookies: CookieMethodsServer }) => {
    mocks.cookies = options.cookies;
    return { auth: { getUser: mocks.getUser } };
  },
}));
vi.mock("../lib/supabase/config", () => ({ getServerConfig: () => ({ url: "https://example.supabase.co", key: "test-anon-key" }) }));
import { middleware } from "../middleware";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
});

describe("protected-route middleware", () => {
  it.each(["/staff", "/staff/grup", "/orangtua", "/admin"])("redirects anonymous requests from %s", async (path) => {
    const response = await middleware(new NextRequest(`https://yuran.test${path}?private=value`));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://yuran.test/login");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("passes a server-verified user through", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const response = await middleware(new NextRequest("https://yuran.test/staff"));
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("preserves refreshed cookies and cache headers on a login redirect", async () => {
    mocks.getUser.mockImplementation(async () => {
      await mocks.cookies?.setAll?.([{ name: "session", value: "", options: { maxAge: 0, path: "/" } }], { "Cache-Control": "private, no-store", "Pragma": "no-cache" });
      return { data: { user: null }, error: { message: "expired" } };
    });
    const response = await middleware(new NextRequest("https://yuran.test/admin"));
    expect(response.headers.get("location")).toBe("https://yuran.test/login");
    expect(response.cookies.get("session")?.value).toBe("");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });

  it("forwards the newest request cookies if refresh writes more than once", async () => {
    mocks.getUser.mockImplementation(async () => {
      await mocks.cookies?.setAll?.([{ name: "session", value: "first", options: { path: "/" } }], { "Cache-Control": "private, no-store" });
      await mocks.cookies?.setAll?.([{ name: "session", value: "latest", options: { path: "/" } }], {});
      return { data: { user: { id: "user-1" } }, error: null };
    });
    const response = await middleware(new NextRequest("https://yuran.test/staff"));
    expect(response.cookies.get("session")?.value).toBe("latest");
    expect(response.headers.get("x-middleware-request-cookie")).toContain("session=latest");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
});
