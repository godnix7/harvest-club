import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export type Role = "super" | "admin";
export type Session = { role: Role; email: string; uid?: string; exp: number };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

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

function b64encode(text: string): string {
  const bytes = encoder.encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64decode(value: string): string {
  const bin = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return decoder.decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
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

/** Creates a signed, expiring session token: `<base64url(json)>.<hmac>` */
export async function createSessionToken(session: Omit<Session, "exp">): Promise<string> {
  const payload = b64encode(JSON.stringify({ ...session, exp: Date.now() + SESSION_MAX_AGE * 1000 }));
  return `${payload}.${await sign(payload)}`;
}

/** Verifies signature and expiry and returns the session, or null. Safe to call in the proxy. */
export async function readSessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, await sign(payload))) return null;
  try {
    const s = JSON.parse(b64decode(payload)) as Session;
    if (!(s.exp > Date.now()) || (s.role !== "super" && s.role !== "admin") || !s.email) return null;
    return s;
  } catch {
    return null;
  }
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  return (await readSessionToken(token)) !== null;
}

/** Returns whether the current request has a valid signed admin session. */
export async function isAdmin(): Promise<boolean> {
  return (await getSession()) !== null;
}

/** Session from the cookie (signature + expiry only). Use currentAdmin() for the full check. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Constant-time comparison against the Super Admin credentials from the environment. */
export async function credentialsMatch(email: string, password: string): Promise<boolean> {
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
