import Image from "next/image";
import type { Metadata } from "next";
import { prisma, safe, categoryLabel } from "@/lib/site";
import { AdminHeader, Empty } from "../_components/AdminPage";
import { ActionButton, FormPanel } from "../_components/controls";
import GalleryUploader from "./GalleryUploader";
import { deleteGalleryImage } from "./actions";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const images = await safe(() => prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } }), []);

  return (
    <div>
      <AdminHeader title="Gallery" description="Upload photos from events. They appear on the public gallery, filterable by category." />
      <div className="grid gap-8 xl:grid-cols-3">
        <FormPanel title="Add photos">
          <GalleryUploader />
        </FormPanel>

        <section className="xl:col-span-2">
          {images.length === 0 ? (
            <div className="admin-card"><Empty>No photos yet.</Empty></div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img) => (
                <li key={img.id} className="admin-card overflow-hidden !p-0">
                  <div className="relative aspect-[4/3] bg-[var(--color-paper)]">
                    <Image src={img.url} alt={img.caption || "Gallery photo"} fill sizes="300px" className="object-cover" />
                  </div>
                  <div className="flex items-start justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{img.caption || "No caption"}</p>
                      <p className="text-xs text-[var(--color-muted)]">{categoryLabel(img.category)}</p>
                    </div>
                    <ActionButton action={deleteGalleryImage.bind(null, img.id)} label="Delete" variant="danger" confirmText="Delete this photo?" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
