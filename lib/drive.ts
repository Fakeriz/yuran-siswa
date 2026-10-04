const TOKEN_URL = "https://oauth2.googleapis.com/token";
const UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const encoder = new TextEncoder();

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

function serviceAccountFrom(json: string): ServiceAccount {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error("Konfigurasi service account Google Drive tidak valid.");
  }
  if (
    !value || typeof value !== "object" ||
    !("type" in value) || value.type !== "service_account" ||
    !("client_email" in value) || typeof value.client_email !== "string" || !value.client_email.trim() ||
    !("private_key" in value) || typeof value.private_key !== "string" || !value.private_key.trim()
  ) {
    throw new Error("Konfigurasi service account Google Drive tidak valid.");
  }
  return { client_email: value.client_email, private_key: value.private_key };
}

function base64Url(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signedAssertion(account: ServiceAccount): Promise<string> {
  let key: CryptoKey;
  try {
    const pem = account.private_key.trim();
    if (!pem.startsWith("-----BEGIN PRIVATE KEY-----") || !pem.endsWith("-----END PRIVATE KEY-----")) {
      throw new Error("Expected PKCS8 key");
    }
    const encoded = pem.replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "").replace(/\s/g, "");
    const der = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  } catch {
    throw new Error("Kunci privat service account Google Drive tidak valid.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(encoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = base64Url(encoder.encode(JSON.stringify({
    iss: account.client_email, scope: DRIVE_SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600,
  })));
  const message = `${header}.${payload}`;
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(message));
  return `${message}.${base64Url(new Uint8Array(signature))}`;
}

async function checkedFetch(url: string, init: RequestInit, operation: string): Promise<Response> {
  const response = await fetch(url, {
    ...init, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`${operation} gagal (HTTP ${response.status}).`);
  return response;
}

async function responseField(response: Response, field: string): Promise<string> {
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !(field in data)) {
    throw new Error("Respons Google Drive tidak lengkap.");
  }
  const value = (data as Record<string, unknown>)[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Respons Google Drive tidak valid.");
  }
  return value;
}

export async function uploadFile(data: Uint8Array, filename: string, mimeType: string): Promise<string> {
  const folderId = process.env.DRIVE_FOLDER_ID?.trim();
  const json = process.env.DRIVE_SERVICE_ACCOUNT_JSON;
  if (!folderId || !json) throw new Error("Konfigurasi Google Drive belum tersedia.");

  const assertion = await signedAssertion(serviceAccountFrom(json));
  const tokenResponse = await checkedFetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  }, "Autentikasi Google Drive");
  const token = await responseField(tokenResponse, "access_token");
  const authorization = `Bearer ${token}`;

  const url = new URL(UPLOAD_URL);
  url.search = new URLSearchParams({ uploadType: "resumable", fields: "id", supportsAllDrives: "true" }).toString();
  const session = await checkedFetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": mimeType,
      "X-Upload-Content-Length": String(data.byteLength),
    },
    body: JSON.stringify({ name: filename, parents: [folderId] }),
  }, "Pembuatan sesi upload Google Drive");

  const location = session.headers.get("Location");
  let uploadUrl: URL;
  try {
    uploadUrl = new URL(location ?? "");
    if (uploadUrl.origin !== "https://www.googleapis.com" ||
        uploadUrl.pathname !== "/upload/drive/v3/files" || uploadUrl.username || uploadUrl.password) {
      throw new Error("Unexpected upload destination");
    }
  } catch {
    throw new Error("URL sesi upload Google Drive tidak valid.");
  }

  const uploaded = await checkedFetch(uploadUrl.toString(), {
    method: "PUT",
    headers: { Authorization: authorization, "Content-Type": mimeType },
    body: new Uint8Array(data),
  }, "Upload Google Drive");
  return responseField(uploaded, "id");
}

export function getViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;
}
