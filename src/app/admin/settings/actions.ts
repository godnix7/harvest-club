"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getSiteSettings() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return null;
  }

  try {
    // @ts-ignore
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      // @ts-ignore
      settings = await prisma.siteSettings.create({
        data: { id: "global" }
      });
    }

    return settings;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateSiteSettings(formData: FormData) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return { error: "Unauthorized" };
  }

  const showAboutPreview = formData.get("showAboutPreview") === "on";
  const showActivities = formData.get("showActivities") === "on";
  const showSponsors = formData.get("showSponsors") === "on";
  const showCTA = formData.get("showCTA") === "on";

  try {
    // @ts-ignore
    await prisma.siteSettings.upsert({
      where: { id: "global" },
      update: {
        showAboutPreview,
        showActivities,
        showSponsors,
        showCTA,
      },
      create: {
        id: "global",
        showAboutPreview,
        showActivities,
        showSponsors,
        showCTA,
      }
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
