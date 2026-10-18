import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { safe, safeUrl } from "@/lib/site";

/** Built-in text used whenever the Super Admin leaves a setting empty. */
export const DEFAULTS = {
  clubName: "Harvest Club",
  tagline: "Cultivating the future of agritech",
  heroTitle: "Agritech Innovation",
  heroSubtitle:
    "A student community exploring where technology meets nature — through hackathons, workshops, industry visits and ideas that grow.",
  missionText:
    "Harvest Club is dedicated to bridging the gap between traditional agriculture and modern technology. We empower students to build sustainable, innovative and impactful solutions for the future.",
  visionText:
    "To be the leading student community for agritech innovation — a network of forward-thinking individuals who will shape the future of technology and nature.",
  footerText:
    "Empowering students through agritech innovation, technology and future-oriented solutions.",
  maintenanceMessage:
    "We are making some improvements and will be back shortly. Thank you for your patience.",
};

const clean = (v?: string | null) => (v && v.trim() ? v.trim() : null);

export type SiteConfig = {
  clubName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  missionText: string;
  visionText: string;
  footerText: string;
  contactEmail: string | null;
  contactPhone: string | null;
  location: string | null;
  social: { label: string; url: string }[];
  bannerText: string | null;
  bannerLink: string | null;
  showAboutPreview: boolean;
  showActivities: boolean;
  showSponsors: boolean;
  showCTA: boolean;
  showTeamContacts: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
};

/** Site settings with defaults applied. Cached per request; pages are regenerated when settings change. */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const row = await safe(() => prisma.siteSettings.findUnique({ where: { id: "global" } }), null);

  const social = [
    { label: "LinkedIn", url: clean(row?.linkedinUrl) ?? process.env.NEXT_PUBLIC_LINKEDIN_URL },
    { label: "Instagram", url: clean(row?.instagramUrl) ?? process.env.NEXT_PUBLIC_INSTAGRAM_URL },
    { label: "GitHub", url: clean(row?.githubUrl) ?? process.env.NEXT_PUBLIC_GITHUB_URL },
    { label: "YouTube", url: clean(row?.youtubeUrl) },
  ]
    .map((s) => ({ label: s.label, url: safeUrl(s.url) }))
    .filter((s): s is { label: string; url: string } => Boolean(s.url));

  return {
    clubName: clean(row?.clubName) ?? DEFAULTS.clubName,
    tagline: clean(row?.tagline) ?? DEFAULTS.tagline,
    heroTitle: clean(row?.heroTitle) ?? DEFAULTS.heroTitle,
    heroSubtitle: clean(row?.heroSubtitle) ?? DEFAULTS.heroSubtitle,
    missionText: clean(row?.missionText) ?? DEFAULTS.missionText,
    visionText: clean(row?.visionText) ?? DEFAULTS.visionText,
    footerText: clean(row?.footerText) ?? DEFAULTS.footerText,
    contactEmail: clean(row?.contactEmail) ?? clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    contactPhone: clean(row?.contactPhone),
    location: clean(row?.location) ?? clean(process.env.NEXT_PUBLIC_CLUB_LOCATION),
    social,
    bannerText: clean(row?.bannerText),
    bannerLink: clean(row?.bannerLink),
    showAboutPreview: row?.showAboutPreview ?? true,
    showActivities: row?.showActivities ?? true,
    showSponsors: row?.showSponsors ?? true,
    showCTA: row?.showCTA ?? true,
    showTeamContacts: row?.showTeamContacts ?? true,
    maintenanceMode: row?.maintenanceMode ?? false,
    maintenanceMessage: clean(row?.maintenanceMessage) ?? DEFAULTS.maintenanceMessage,
  };
});
