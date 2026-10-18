import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { prisma, safe, categoryLabel } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from Harvest Club events, hackathons and workshops.",
};

export const revalidate = 60;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const images = await safe(
    () => prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } }),
    []
  );

  const categories = [...new Set(images.map((i) => i.category).filter((c) => c && c !== "ALL"))];
  const active = category && categories.includes(category) ? category : null;
  const visible = active ? images.filter((i) => i.category === active) : images;

  const pill = (isActive: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-medium transition ${
      isActive
        ? "border-[var(--color-harvest-green)] bg-[var(--color-harvest-green)] text-white"
        : "border-[var(--color-line)] bg-white text-[var(--color-muted)] hover:border-[var(--color-harvest-green)] hover:text-[var(--color-harvest-green)]"
    }`;

  return (
    <>
      <PageHeader eyebrow="Gallery" title="Gallery" lead="A visual record of our activities and events." />
      <div className="container-page py-12">
        {categories.length > 0 && (
          <nav aria-label="Filter by category" className="mb-8 flex flex-wrap gap-2">
            <Link href="/gallery" className={pill(!active)}>All</Link>
            {categories.map((c) => (
              <Link key={c} href={`/gallery?category=${c}`} className={pill(active === c)}>
                {categoryLabel(c)}
              </Link>
            ))}
          </nav>
        )}

        {visible.length === 0 ? (
          <div className="card border-dashed p-10 text-center text-sm text-[var(--color-muted)]">
            Photos will be added after our upcoming events.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((img) => (
              <a
                key={img.id}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-lg bg-[var(--color-paper)]"
              >
                <Image
                  src={img.url}
                  alt={img.caption || "Harvest Club event photo"}
                  fill
                  sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                {img.caption && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    {img.caption}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
