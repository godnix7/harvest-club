"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { guard, errorMessage, httpUrl, type ActionResult } from "@/lib/admin";
import { EVENT_CATEGORIES } from "@/lib/site";

function refresh() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin");
}

export async function addGalleryImage(url: string, category: string, caption: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  const clean = httpUrl(url.trim());
  if (!clean) return { error: "A valid http(s) image URL is required." };
  if (!(category in EVENT_CATEGORIES)) return { error: "Choose a valid category." };

  try {
    await prisma.galleryImage.create({ data: { url: clean, category, caption: caption.trim().slice(0, 200) || null } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function updateGalleryImage(id: string, fd: FormData): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  const category = String(fd.get("category") ?? "");
  if (!(category in EVENT_CATEGORIES)) return { error: "Choose a valid category." };
  try {
    await prisma.galleryImage.update({
      where: { id },
      data: { category, caption: String(fd.get("caption") ?? "").trim().slice(0, 200) || null },
    });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await prisma.galleryImage.delete({ where: { id } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
