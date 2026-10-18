import { currentAdmin } from "@/lib/session";

export type ActionResult = { success?: true; error?: string };

/** Returns an error result when the caller is not an active, signed-in admin. */
export async function guard(): Promise<ActionResult | null> {
  return (await currentAdmin()) ? null : { error: "Your session has expired. Please sign in again." };
}

/** Like guard(), but only the Super Admin passes. */
export async function guardSuper(): Promise<ActionResult | null> {
  const admin = await currentAdmin();
  if (!admin) return { error: "Your session has expired. Please sign in again." };
  return admin.role === "super" ? null : { error: "Only the Super Admin can do this." };
}

export function text(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export function optional(fd: FormData, key: string): string | null {
  const v = text(fd, key);
  return v === "" ? null : v;
}

export function int(fd: FormData, key: string, fallback = 0): number {
  const n = parseInt(text(fd, key), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Turns a thrown database error into a message that tells the admin what actually went wrong. */
export function errorMessage(error: unknown): string {
  console.error(error);
  const code = (error as { code?: string } | null)?.code;
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : "";

  if (name === "PrismaClientInitializationError" || code === "P1001" || code === "P1002" || code === "P1000") {
    return "Cannot connect to the database. Check that the Supabase project is running and DATABASE_URL is correct.";
  }
  if (code === "P2021" || code === "P2022") {
    return "The database tables are missing or out of date. Run “npx prisma db push” against the production database.";
  }
  if (code === "P2025" || message.includes("Record to")) return "That record no longer exists.";
  if (code === "P2002") return "A record with these details already exists.";
  if (code === "P2000") return "One of the values is too long for the database.";

  return `Could not save (${code ?? name ?? "unknown error"}). Please try again or check the server logs.`;
}

/**
 * Google Drive share links open a web page, not an image. Convert them to a direct
 * image URL (the file must be shared as "Anyone with the link").
 */
export function normalizeImageUrl(raw: string): string {
  try {
    const u = new URL(raw);
    if (u.hostname === "drive.google.com" || u.hostname === "docs.google.com") {
      const id =
        u.pathname.match(/\/d\/([\w-]+)/)?.[1] ?? u.searchParams.get("id");
      if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
    }
  } catch {
    /* handled by caller */
  }
  return raw;
}

/** Accepts only http(s) URLs (or empty). Returns null when empty, false when invalid. */
export function httpUrl(value: string | null): string | null | false {
  if (!value) return null;
  try {
    const u = new URL(normalizeImageUrl(value));
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : false;
  } catch {
    return false;
  }
}

/** Optional email: returns null when empty, false when invalid. */
export function optionalEmail(value: string | null): string | null | false {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 200 ? v : false;
}

/** Optional phone: digits with optional +, spaces, dashes, brackets (7–15 digits). */
export function optionalPhone(value: string | null): string | null | false {
  if (!value) return null;
  const v = value.trim();
  const digits = v.replace(/\D/g, "");
  return /^[+(\d][\d\s\-()]*$/.test(v) && digits.length >= 7 && digits.length <= 15 ? v : false;
}

/** Link for an announcement button: a site path ("/events/abc") or an http(s) URL. */
export function optionalLink(value: string | null): string | null | false {
  if (!value) return null;
  const v = value.trim();
  if (v.startsWith("/") && !v.startsWith("//")) return v.length <= 300 ? v : false;
  const url = httpUrl(v);
  return url === null ? null : url;
}
