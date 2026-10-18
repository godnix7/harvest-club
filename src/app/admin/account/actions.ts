"use server";

import { prisma } from "@/lib/prisma";
import { currentAdmin } from "@/lib/session";
import { errorMessage, type ActionResult } from "@/lib/admin";
import { hashPassword, verifyPassword, passwordProblem } from "@/lib/password";

export async function changeOwnPassword(fd: FormData): Promise<ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return { error: "Your session has expired. Please sign in again." };

  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  if (next !== confirm) return { error: "The new passwords do not match." };
  const problem = passwordProblem(next);
  if (problem) return { error: problem };
  if (next === current) return { error: "Choose a password different from the current one." };

  try {
    const user = await prisma.adminUser.findUnique({ where: { id: admin.uid } });
    if (!user || !(await verifyPassword(current, user.passwordHash))) return { error: "Your current password is incorrect." };
    await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
