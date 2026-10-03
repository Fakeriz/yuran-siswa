import { Buffer } from "node:buffer";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getViewUrl, uploadFile } from "../lib/drive";

const fetchMock = vi.fn<typeof fetch>();
const sessionUrl = "https://www.googleapis.com/upload/drive/v3/files?upload_id=test-session";
let keys: CryptoKeyPair;
let credentials: string;

beforeAll(async () => {
  keys = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const der = await crypto.subtle.exportKey("pkcs8", keys.privateKey);
  credentials = JSON.stringify({ type: "service_account", client_email: "test@example.invalid", private_key: `-----BEGIN PRIVATE KEY-----\n${Buffer.from(der).toString("base64")}\n-----END PRIVATE KEY-----\n` });
});

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("DRIVE_FOLDER_ID", "folder-1");
  vi.stubEnv("DRIVE_SERVICE_ACCOUNT_JSON", credentials);
  fetchMock
    .mockResolvedValueOnce(Response.json({ access_token: "test-token", token_type: "Bearer" }))
    .mockResolvedValueOnce(new Response(null, { status: 200, headers: { Location: sessionUrl } }))
    .mockResolvedValueOnce(Response.json({ id: "file-123" }));
});

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("uploadFile", () => {
  it("signs a valid service-account JWT, uploads bytes into the folder, and returns the ID", async () => {
    const bytes = Buffer.from([0, 255, 127, 10]);
    expect(await uploadFile(bytes, "bukti.pdf", "application/pdf")).toBe("file-123");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const [tokenUrl, tokenRequest] = fetchMock.mock.calls[0];
    expect(tokenUrl).toBe("https://oauth2.googleapis.com/token");
    expect(tokenRequest?.method).toBe("POST");
    const form = new URLSearchParams(String(tokenRequest?.body));
    expect(form.get("grant_type")).toBe("urn:ietf:params:oauth:grant-type:jwt-bearer");
    const [header, payload, signature] = form.get("assertion")!.split(".");
    expect(JSON.parse(Buffer.from(header, "base64url").toString())).toEqual({ alg: "RS256", typ: "JWT" });
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    expect(claims).toMatchObject({ iss: "test@example.invalid", scope: "https://www.googleapis.com/auth/drive.file", aud: "https://oauth2.googleapis.com/token" });
    expect(Math.abs(claims.iat - Math.floor(Date.now() / 1000))).toBeLessThan(5);
    expect(claims.exp - claims.iat).toBe(3600);
    expect(await crypto.subtle.verify("RSASSA-PKCS1-v1_5", keys.publicKey, Buffer.from(signature, "base64url"), new TextEncoder().encode(`${header}.${payload}`))).toBe(true);

    const [startUrl, start] = fetchMock.mock.calls[1];
    const url = new URL(String(startUrl));
    expect(url.origin + url.pathname).toBe("https://www.googleapis.com/upload/drive/v3/files");
    expect(url.searchParams.get("uploadType")).toBe("resumable");
    expect(url.searchParams.get("supportsAllDrives")).toBe("true");
    expect(url.searchParams.get("fields")).toBe("id");
    expect(start?.method).toBe("POST");
    expect(JSON.parse(String(start?.body))).toEqual({ name: "bukti.pdf", parents: ["folder-1"] });
    expect(new Headers(start?.headers).get("Authorization")).toBe("Bearer test-token");
    expect(new Headers(start?.headers).get("X-Upload-Content-Type")).toBe("application/pdf");
    expect(new Headers(start?.headers).get("X-Upload-Content-Length")).toBe("4");

    const [putUrl, put] = fetchMock.mock.calls[2];
    expect(putUrl).toBe(sessionUrl);
    expect(put?.method).toBe("PUT");
    expect(new Headers(put?.headers).get("Content-Type")).toBe("application/pdf");
    expect(Buffer.from(await new Response(put?.body).arrayBuffer())).toEqual(bytes);
  });

  it.each(["DRIVE_FOLDER_ID", "DRIVE_SERVICE_ACCOUNT_JSON"])("rejects missing %s without network requests", async (key) => {
    vi.stubEnv(key, "");
    await expect(uploadFile(Buffer.from("test"), "file.txt", "text/plain")).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["not-json", "null", "{}", '{"type":"service_account","client_email":"test@example.invalid","private_key":"bad-key"}'])("rejects invalid credentials %s without network requests", async (value) => {
    vi.stubEnv("DRIVE_SERVICE_ACCOUNT_JSON", value);
    await expect(uploadFile(Buffer.from("test"), "file.txt", "text/plain")).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([0, 1, 2])("stops at failed HTTP step %i without leaking response details", async (step) => {
    fetchMock.mockReset();
    const replies = [Response.json({ access_token: "test-token" }), new Response(null, { headers: { Location: sessionUrl } }), Response.json({ id: "file-123" })];
    replies[step] = new Response("sensitive-upstream-detail", { status: 403 });
    for (const reply of replies) fetchMock.mockResolvedValueOnce(reply);
    const result = uploadFile(Buffer.from("test"), "file.txt", "text/plain");
    await expect(result).rejects.toThrow(/403/);
    await expect(result).rejects.not.toThrow("sensitive-upstream-detail");
    expect(fetchMock).toHaveBeenCalledTimes(step + 1);
  });

  it.each([
    [0, {}], [0, { access_token: 123 }], [2, {}], [2, { id: "" }],
  ])("rejects malformed JSON response at step %i: %j", async (step, body) => {
    fetchMock.mockReset();
    const replies = [Response.json({ access_token: "test-token" }), new Response(null, { headers: { Location: sessionUrl } }), Response.json({ id: "file-123" })];
    replies[step as number] = Response.json(body);
    for (const reply of replies) fetchMock.mockResolvedValueOnce(reply);
    await expect(uploadFile(Buffer.from("test"), "file.txt", "text/plain")).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(Number(step) + 1);
  });

  it.each([undefined, "https://attacker.invalid/upload", "http://www.googleapis.com/upload"])("rejects missing or unsafe upload session %s", async (location) => {
    fetchMock.mockReset().mockResolvedValueOnce(Response.json({ access_token: "test-token" })).mockResolvedValueOnce(new Response(null, { headers: location ? { Location: location } : {} }));
    await expect(uploadFile(Buffer.from("test"), "file.txt", "text/plain")).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("getViewUrl", () => {
  it("returns a Drive view URL containing the file ID", () => {
    expect(getViewUrl("abc123")).toBe("https://drive.google.com/file/d/abc123/view");
  });
  it("encodes the file ID as one path component", () => {
    expect(getViewUrl("a/b?c")).toBe("https://drive.google.com/file/d/a%2Fb%3Fc/view");
  });
});
