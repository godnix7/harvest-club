"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { guard, errorMessage, type ActionResult } from "@/lib/admin";

export async function updateSiteSettings(fd: FormData): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const data = {
    showAboutPreview: fd.get("showAboutPreview") === "on",
    showActivities: fd.get("showActivities") === "on",
    showSponsors: fd.get("showSponsors") === "on",
    showCTA: fd.get("showCTA") === "on",
  };

  try {
    await prisma.siteSettings.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data },
    });
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
