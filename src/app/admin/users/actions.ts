"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { guardSuper, text, errorMessage, type ActionResult } from "@/lib/admin";
import { currentAdmin } from "@/lib/session";
import { hashPassword, passwordProblem } from "@/lib/password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["ADMIN", "SUPER"];

function refresh() {
  revalidatePath("/admin/users");
}

/** True when changing/removing this account would leave no active Super Admin. */
async function isLastActiveSuper(id: string): Promise<boolean> {
  const target = await prisma.adminUser.findUnique({ where: { id }, select: { role: true, isActive: true } });
  if (!target || target.role !== "SUPER" || !target.isActive) return false;
  const others = await prisma.adminUser.count({ where: { role: "SUPER", isActive: true, id: { not: id } } });
  return others === 0;
}

export async function createAdmin(fd: FormData): Promise<ActionResult> {
  const denied = await guardSuper();
  if (denied) return denied;

  const name = text(fd, "name");
  const email = text(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const role = text(fd, "role") || "ADMIN";
  const canEditSettings = fd.get("canEditSettings") === "on";

  if (name.length < 2 || name.length > 100) return { error: "Please enter the person's name." };
  if (!EMAIL_RE.test(email) || email.length > 200) return { error: "Please enter a valid email address." };
  if (!ROLES.includes(role)) return { error: "Choose a valid role." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };

  try {
    await prisma.adminUser.create({ data: { name, email, role, canEditSettings, passwordHash: await hashPassword(password) } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function setSettingsAccess(id: string, allowed: boolean): Promise<ActionResult> {
  const denied = await guardSuper();
  if (denied) return denied;
  try {
    await prisma.adminUser.update({ where: { id }, data: { canEditSettings: allowed } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function setAdminRole(id: string, role: string): Promise<ActionResult> {
  const denied = await guardSuper();
  if (denied) return denied;
  if (!ROLES.includes(role)) return { error: "Choose a valid role." };
  try {
    if (role !== "SUPER" && (await isLastActiveSuper(id))) {
      return { error: "There must always be at least one active Super Admin. Promote someone else first." };
    }
    await prisma.adminUser.update({ where: { id }, data: { role } });
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
    if (!isActive) {
      if ((await currentAdmin())?.uid === id) return { error: "You can't disable your own account." };
      if (await isLastActiveSuper(id)) {
        return { error: "There must always be at least one active Super Admin." };
      }
    }
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
    if ((await currentAdmin())?.uid === id) return { error: "You can't delete your own account." };
    if (await isLastActiveSuper(id)) {
      return { error: "There must always be at least one active Super Admin." };
    }
    await prisma.adminUser.delete({ where: { id } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
