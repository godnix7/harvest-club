import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

const encoder = new TextEncoder();

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    `${process.env.ADMIN_EMAIL ?? ""}:${process.env.ADMIN_PASSWORD ?? ""}:harvest-session`
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Creates a signed, expiring session token: `<expiresAtMs>.<hmac>` */
export async function createSessionToken(): Promise<string> {
  const expires = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${expires}.${await sign(expires)}`;
}

/** Verifies signature and expiry. Works in both the proxy and server actions. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  if (!(Number(expires) > Date.now())) return false;
  return safeEqual(signature, await sign(expires));
}

/** Server-side check used by every admin page and server action. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Constant-time credential comparison (hashes both sides first). */
export async function credentialsMatch(
  email: string,
  password: string
): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  const [a, b, c, d] = await Promise.all([
    sign(`e:${email.trim().toLowerCase()}`),
    sign(`e:${expectedEmail.trim().toLowerCase()}`),
    sign(`p:${password}`),
    sign(`p:${expectedPassword}`),
  ]);
  return safeEqual(a, b) && safeEqual(c, d);
}
