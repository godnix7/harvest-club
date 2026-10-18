"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  credentialsMatch,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, DUMMY_HASH } from "@/lib/password";

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

  let userId: string;
  try {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

    if (user && valid) {
      if (!user.isActive) {
        return { error: "This account has been disabled. Please contact a Super Admin." };
      }
      userId = user.id;
    } else {
      // One-time bootstrap: while the database has no active Super Admin, the credentials
      // from ADMIN_EMAIL / ADMIN_PASSWORD create the first one. After that they are ignored.
      const superExists = (await prisma.adminUser.count({ where: { role: "SUPER", isActive: true } })) > 0;
      if (superExists || !(await credentialsMatch(email, password))) return fail();

      const passwordHash = await hashPassword(password);
      const created = await prisma.adminUser.upsert({
        where: { email },
        update: { role: "SUPER", isActive: true, passwordHash },
        create: { email, name: "Super Admin", role: "SUPER", passwordHash },
      });
      userId = created.id;
    }

    await prisma.adminUser.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  } catch (error) {
    console.error("Admin login failed:", error);
    return { error: "Could not sign in right now. Please try again in a moment." };
  }

  attempts.delete(key);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await createSessionToken({ role: "admin", email, uid: userId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/admin");
}
