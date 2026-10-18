import { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { prisma, safe, categoryLabel } from "@/lib/site";
import GalleryGrid from "./GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from Harvest Club events, hackathons and workshops.",
};

// Cached and refreshed every minute; the category filter runs in the browser.
export const revalidate = 60;

export default async function GalleryPage() {
  const images = await safe(
    () => prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" }, take: 300 }),
    []
  );

  const categories = [...new Set(images.map((i) => i.category).filter((c) => c && c !== "ALL"))].map((key) => ({
    key,
    label: categoryLabel(key),
  }));

  return (
    <>
      <PageHeader eyebrow="Gallery" title="Gallery" lead="A visual record of our activities and events." />
      <div className="container-page py-8 sm:py-12">
        <GalleryGrid
          images={images.map((i) => ({ id: i.id, url: i.url, caption: i.caption, category: i.category }))}
          categories={categories}
        />
      </div>
    </>
  );
}
