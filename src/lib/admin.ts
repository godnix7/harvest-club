import { isAdmin } from "@/lib/auth";

export type ActionResult = { success?: true; error?: string };

/** Returns an error result when the caller is not an authenticated admin. */
export async function guard(): Promise<ActionResult | null> {
  return (await isAdmin()) ? null : { error: "Your session has expired. Please sign in again." };
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

export function errorMessage(error: unknown): string {
  console.error(error);
  return error instanceof Error && error.message.includes("Record to")
    ? "That record no longer exists."
    : "Something went wrong while saving. Please try again.";
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
