"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  credentialsMatch,
  type Session,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword, DUMMY_HASH } from "@/lib/password";

// Basic in-memory brute-force protection (per server instance).
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const key = email || "unknown";
  const now = Date.now();
  const record = attempts.get(key);
  if (record && now - record.first < WINDOW_MS && record.count >= MAX_ATTEMPTS) {
    return { error: "Too many failed attempts. Please try again in 15 minutes." };
  }

  const fail = () => {
    attempts.set(
      key,
      record && now - record.first < WINDOW_MS
        ? { count: record.count + 1, first: record.first }
        : { count: 1, first: now }
    );
    return { error: "Invalid email or password." };
  };

  let session: Omit<Session, "exp"> | null = null;

  // 1) Super Admin – credentials come from the server environment.
  if (await credentialsMatch(email, password)) {
    session = { role: "super", email };
  } else {
    // 2) Normal admin – stored in the database with a hashed password.
    try {
      const user = await prisma.adminUser.findUnique({ where: { email } });
      const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
      if (!user || !valid) return fail();
      if (!user.isActive) {
        return { error: "This account has been disabled. Please contact the Super Admin." };
      }
      await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
      session = { role: "admin", email: user.email, uid: user.id };
    } catch (error) {
      console.error("Admin login lookup failed:", error);
      return { error: "Invalid email or password." };
    }
  }

  attempts.delete(key);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await createSessionToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/admin");
}
