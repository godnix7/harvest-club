import { prisma } from "@/lib/prisma";

/** Runs a query and falls back gracefully so a DB hiccup never crashes a public page. */
let lastDbWarning = 0;

export async function safe<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    // Log one short line (at most once a minute) instead of a full stack per query.
    if (Date.now() - lastDbWarning > 60_000) {
      lastDbWarning = Date.now();
      const reason = error instanceof Error ? error.message.split("\n").filter(Boolean).pop() : "unknown error";
      console.warn("[db] Query failed, showing fallback content:", reason);
    }
    return fallback;
  }
}

export { prisma };
export * from "@/lib/categories";
import { EVENT_CATEGORIES } from "@/lib/categories";

export function categoryLabel(value: string): string {
  return EVENT_CATEGORIES[value] ?? value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function formatDate(date: Date | string, withTime = false): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Only allows http(s) URLs through to href attributes. */
export function safeUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Resolves a stored announcement link into an href and whether it leaves the site. */
export function safeLink(url?: string | null): { href: string; external: boolean } | null {
  if (!url) return null;
  if (url.startsWith("/") && !url.startsWith("//")) return { href: url, external: false };
  const external = safeUrl(url);
  return external ? { href: external, external: true } : null;
}

/** tel: href from a display phone number. */
export function telHref(phone: string): string {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}
