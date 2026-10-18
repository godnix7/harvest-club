"use client";

import { useState } from "react";
import Image from "next/image";

type Img = { id: string; url: string; caption: string | null; category: string };

export default function GalleryGrid({
  images,
  categories,
}: {
  images: Img[];
  categories: { key: string; label: string }[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? images.filter((i) => i.category === active) : images;

  const pill = (isActive: boolean) =>
    `min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
      isActive
        ? "border-[var(--color-harvest-green)] bg-[var(--color-harvest-green)] text-white"
        : "border-[var(--color-line)] bg-white text-[var(--color-muted)] hover:border-[var(--color-harvest-green)] hover:text-[var(--color-harvest-green)]"
    }`;

  return (
    <>
      {categories.length > 0 && (
        <div role="group" aria-label="Filter by category" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button type="button" onClick={() => setActive(null)} aria-pressed={!active} className={pill(!active)}>All</button>
          {categories.map((c) => (
            <button key={c.key} type="button" onClick={() => setActive(c.key)} aria-pressed={active === c.key} className={pill(active === c.key)}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="card border-dashed p-10 text-center text-sm text-[var(--color-muted)]">
          Photos will be added after our upcoming events.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((img) => (
            <a
              key={img.id}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-xl bg-gradient-soft"
            >
              <Image
                src={img.url}
                alt={img.caption || "Harvest Club event photo"}
                fill
                loading="lazy"
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
    </>
  );
}
