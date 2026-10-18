"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { guard, errorMessage, type ActionResult } from "@/lib/admin";

const STATUSES = ["UNREAD", "READ", "ARCHIVED"];

function refresh() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function setMessageStatus(id: string, status: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  if (!STATUSES.includes(status)) return { error: "Invalid status." };
  try {
    await prisma.contactMessage.update({ where: { id }, data: { status } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await prisma.contactMessage.delete({ where: { id } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
