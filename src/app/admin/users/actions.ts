"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { guardSuper, text, errorMessage, type ActionResult } from "@/lib/admin";
import { hashPassword, passwordProblem } from "@/lib/password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function refresh() {
  revalidatePath("/admin/users");
}

export async function createAdmin(fd: FormData): Promise<ActionResult> {
  const denied = await guardSuper();
  if (denied) return denied;

  const name = text(fd, "name");
  const email = text(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (name.length < 2 || name.length > 100) return { error: "Please enter the person's name." };
  if (!EMAIL_RE.test(email) || email.length > 200) return { error: "Please enter a valid email address." };
  if (email === (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()) {
    return { error: "That email belongs to the Super Admin." };
  }
  const problem = passwordProblem(password);
  if (problem) return { error: problem };

  try {
    await prisma.adminUser.create({ data: { name, email, passwordHash: await hashPassword(password) } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function setAdminActive(id: string, isActive: boolean): Promise<ActionResult> {
  const denied = await guardSuper();
  if (denied) return denied;
  try {
    await prisma.adminUser.update({ where: { id }, data: { isActive } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function resetAdminPassword(id: string, newPassword: string): Promise<ActionResult> {
  const denied = await guardSuper();
  if (denied) return denied;
  const problem = passwordProblem(newPassword);
  if (problem) return { error: problem };
  try {
    await prisma.adminUser.update({ where: { id }, data: { passwordHash: await hashPassword(newPassword) } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function deleteAdmin(id: string): Promise<ActionResult> {
  const denied = await guardSuper();
  if (denied) return denied;
  try {
    await prisma.adminUser.delete({ where: { id } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
