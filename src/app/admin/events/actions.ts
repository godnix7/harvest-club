"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { guard, text, optional, errorMessage, httpUrl, type ActionResult } from "@/lib/admin";
import { EVENT_CATEGORIES, EVENT_STATUSES } from "@/lib/site";

function refresh(id?: string) {
  revalidatePath("/");
  revalidatePath("/events");
  if (id) revalidatePath(`/events/${id}`);
  revalidatePath("/admin/events");
  revalidatePath("/admin");
}

/** Creates (id = null) or updates an event. */
export async function saveEvent(id: string | null, fd: FormData): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const title = text(fd, "title");
  const dateRaw = text(fd, "date");
  const category = text(fd, "category");
  const status = text(fd, "status");
  const description = text(fd, "description");
  const coverImage = httpUrl(optional(fd, "imageUrl"));

  if (!title) return { error: "Title is required." };
  if (!dateRaw || Number.isNaN(new Date(dateRaw).getTime())) return { error: "A valid date is required." };
  if (!description) return { error: "Please add a description." };
  if (!(category in EVENT_CATEGORIES)) return { error: "Choose a valid category." };
  if (!(status in EVENT_STATUSES)) return { error: "Choose a valid status." };
  if (coverImage === false) return { error: "Image URL must start with http:// or https://" };

  const data = {
    title,
    description,
    date: new Date(dateRaw),
    category,
    status,
    venue: optional(fd, "venue"),
    highlights: optional(fd, "highlights"),
    results: optional(fd, "results"),
    coverImage,
    isFeatured: fd.get("isFeatured") === "on",
  };

  try {
    if (id) await prisma.event.update({ where: { id }, data });
    else await prisma.event.create({ data });
    refresh(id ?? undefined);
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function toggleFeatured(id: string, value: boolean): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await prisma.event.update({ where: { id }, data: { isFeatured: value } });
    refresh(id);
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await prisma.event.delete({ where: { id } });
    refresh(id);
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
