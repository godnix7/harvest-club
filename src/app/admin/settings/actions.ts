"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  guardSuper, text, optional, errorMessage, httpUrl, optionalEmail, optionalPhone, optionalLink,
  type ActionResult,
} from "@/lib/admin";

const LIMITS: Record<string, number> = {
  clubName: 60, tagline: 100, heroTitle: 80, heroSubtitle: 300, missionText: 800, visionText: 800,
  footerText: 300, location: 200, bannerText: 160, maintenanceMessage: 300,
};

export async function updateSiteSettings(fd: FormData): Promise<ActionResult> {
  const denied = await guardSuper();
  if (denied) return denied;

  for (const [key, max] of Object.entries(LIMITS)) {
    if (text(fd, key).length > max) return { error: `“${key}” is too long (maximum ${max} characters).` };
  }

  const contactEmail = optionalEmail(optional(fd, "contactEmail"));
  const contactPhone = optionalPhone(optional(fd, "contactPhone"));
  const linkedinUrl = httpUrl(optional(fd, "linkedinUrl"));
  const instagramUrl = httpUrl(optional(fd, "instagramUrl"));
  const githubUrl = httpUrl(optional(fd, "githubUrl"));
  const youtubeUrl = httpUrl(optional(fd, "youtubeUrl"));
  const bannerLink = optionalLink(optional(fd, "bannerLink"));

  if (contactEmail === false) return { error: "Please enter a valid contact email, or leave it blank." };
  if (contactPhone === false) return { error: "Please enter a valid contact phone number, or leave it blank." };
  if (linkedinUrl === false || instagramUrl === false || githubUrl === false || youtubeUrl === false) {
    return { error: "Social links must start with http:// or https://" };
  }
  if (bannerLink === false) return { error: "The banner link must be a page on this site (like /events) or start with http:// or https://" };

  const data = {
    showAboutPreview: fd.get("showAboutPreview") === "on",
    showActivities: fd.get("showActivities") === "on",
    showSponsors: fd.get("showSponsors") === "on",
    showCTA: fd.get("showCTA") === "on",
    showTeamContacts: fd.get("showTeamContacts") === "on",
    maintenanceMode: fd.get("maintenanceMode") === "on",
    clubName: optional(fd, "clubName"),
    tagline: optional(fd, "tagline"),
    heroTitle: optional(fd, "heroTitle"),
    heroSubtitle: optional(fd, "heroSubtitle"),
    missionText: optional(fd, "missionText"),
    visionText: optional(fd, "visionText"),
    footerText: optional(fd, "footerText"),
    contactEmail,
    contactPhone,
    location: optional(fd, "location"),
    linkedinUrl,
    instagramUrl,
    githubUrl,
    youtubeUrl,
    bannerText: optional(fd, "bannerText"),
    bannerLink: optional(fd, "bannerText") ? bannerLink : null,
    maintenanceMessage: optional(fd, "maintenanceMessage"),
  };

  try {
    await prisma.siteSettings.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data },
    });
    // Settings appear in the header, footer and many pages, so refresh the whole site.
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
