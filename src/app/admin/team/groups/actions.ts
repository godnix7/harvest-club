"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { guard, text, optional, int, errorMessage, type ActionResult } from "@/lib/admin";

function refresh() {
  revalidatePath("/team");
  revalidatePath("/admin/team");
  revalidatePath("/admin/team/groups");
}

export async function saveGroup(id: string | null, fd: FormData): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const name = text(fd, "name");
  if (name.length < 2 || name.length > 80) return { error: "Please enter a team name (2–80 characters)." };

  const data = { name, description: optional(fd, "description"), orderIndex: int(fd, "orderIndex") };
  try {
    if (id) await prisma.teamGroup.update({ where: { id }, data });
    else await prisma.teamGroup.create({ data });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function deleteGroup(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    // Members stay on the site; they simply no longer belong to a wing.
    await prisma.$transaction([
      prisma.teamMember.updateMany({ where: { teamGroupId: id }, data: { teamGroupId: null } }),
      prisma.teamGroup.delete({ where: { id } }),
    ]);
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
