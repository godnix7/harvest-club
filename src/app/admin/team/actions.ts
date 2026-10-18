"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { guard, text, optional, int, errorMessage, httpUrl, type ActionResult } from "@/lib/admin";
import { TEAM_CATEGORIES } from "@/lib/site";

function refresh() {
  revalidatePath("/team");
  revalidatePath("/team/previous");
  revalidatePath("/admin/team");
  revalidatePath("/admin");
}

export async function saveMember(id: string | null, fd: FormData): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const name = text(fd, "name");
  const position = text(fd, "position");
  const category = text(fd, "category");
  const photoUrl = httpUrl(optional(fd, "imageUrl"));
  const linkedin = httpUrl(optional(fd, "linkedin"));

  if (!name || !position) return { error: "Name and position are required." };
  if (!(category in TEAM_CATEGORIES)) return { error: "Choose a valid group." };
  if (photoUrl === false) return { error: "Photo URL must start with http:// or https://" };
  if (linkedin === false) return { error: "LinkedIn URL must start with http:// or https://" };
  if (category === "PREVIOUS" && !optional(fd, "year")) return { error: "Please enter the tenure (e.g. 2024-2025) for previous members." };

  const data = {
    name,
    position,
    category,
    department: optional(fd, "department"),
    year: optional(fd, "year"),
    bio: optional(fd, "bio"),
    orderIndex: int(fd, "orderIndex"),
    photoUrl,
    socialLinks: linkedin ? JSON.stringify({ linkedin }) : null,
  };

  try {
    if (id) await prisma.teamMember.update({ where: { id }, data });
    else await prisma.teamMember.create({ data });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function deleteMember(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await prisma.teamMember.delete({ where: { id } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
