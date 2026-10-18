"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  credentialsMatch,
} from "@/lib/auth";

// Basic in-memory brute-force protection (per server instance).
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    return { error: "Admin credentials are not configured on the server." };
  }

  const key = email.trim().toLowerCase() || "unknown";
  const now = Date.now();
  const record = attempts.get(key);
  if (record && now - record.first < WINDOW_MS && record.count >= MAX_ATTEMPTS) {
    return { error: "Too many failed attempts. Please try again in 15 minutes." };
  }

  if (!(await credentialsMatch(email, password))) {
    attempts.set(
      key,
      record && now - record.first < WINDOW_MS
        ? { count: record.count + 1, first: record.first }
        : { count: 1, first: now }
    );
    return { error: "Invalid email or password." };
  }

  attempts.delete(key);
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    await createSessionToken({ role: "super", email: email.trim().toLowerCase() }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    }
  );

  redirect("/admin");
}
