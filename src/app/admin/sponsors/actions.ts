"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { guard, text, optional, int, errorMessage, httpUrl, type ActionResult } from "@/lib/admin";
import { SPONSOR_TIERS } from "@/lib/categories";

function refresh() {
  revalidatePath("/");
  revalidatePath("/sponsors");
  revalidatePath("/admin/sponsors");
  revalidatePath("/admin");
}

export async function saveSponsor(id: string | null, fd: FormData): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const name = text(fd, "name");
  const tier = text(fd, "tier");
  const logoUrl = httpUrl(optional(fd, "imageUrl"));
  const websiteUrl = httpUrl(optional(fd, "websiteUrl"));

  if (!name) return { error: "Sponsor name is required." };
  if (!SPONSOR_TIERS.includes(tier)) return { error: "Choose a valid tier." };
  if (logoUrl === false) return { error: "Logo URL must start with http:// or https://" };
  if (websiteUrl === false) return { error: "Website must start with http:// or https://" };

  const data = {
    name,
    tier,
    description: optional(fd, "description"),
    logoUrl,
    websiteUrl,
    orderIndex: int(fd, "orderIndex"),
    isActive: fd.get("isActive") === "on",
  };

  try {
    if (id) await prisma.sponsor.update({ where: { id }, data });
    else await prisma.sponsor.create({ data });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function setSponsorActive(id: string, isActive: boolean): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await prisma.sponsor.update({ where: { id }, data: { isActive } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function deleteSponsor(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await prisma.sponsor.delete({ where: { id } });
    refresh();
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
