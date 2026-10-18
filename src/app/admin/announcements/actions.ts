"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { guard, text, optional, errorMessage, optionalLink, type ActionResult } from "@/lib/admin";

function refresh() {
  revalidatePath("/");
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
  revalidatePath("/admin");
}

export async function saveAnnouncement(id: string | null, fd: FormData): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const title = text(fd, "title");
  const description = text(fd, "description");
  if (!title || !description) return { error: "Title and message are required." };

  const linkUrl = optionalLink(optional(fd, "linkUrl"));
  if (linkUrl === false) return { error: "The link must be a page on this site (like /events) or start with http:// or https://" };
  const linkLabel = optional(fd, "linkLabel");
  if (linkLabel && linkLabel.length > 40) return { error: "Button text must be 40 characters or fewer." };

  const data = {
    title,
    description,
    category: optional(fd, "category"),
    linkUrl,
    linkLabel: linkUrl ? linkLabel || "Learn more" : null,
    isFeatured: fd.get("isFeatured") === "on",
    isPublished: fd.get("isPublished") === "on",
  };

  try {
    if (id) await prisma.announcement.update({ where: { id }, data });
    else await prisma.announcement.create({ data });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function setPublished(id: string, isPublished: boolean): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await prisma.announcement.update({ where: { id }, data: { isPublished } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await prisma.announcement.delete({ where: { id } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
