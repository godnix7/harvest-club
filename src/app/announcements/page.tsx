import { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { prisma, safe, formatDate } from "@/lib/site";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Latest news and announcements from Harvest Club.",
};

export const revalidate = 60;

export default async function AnnouncementsPage() {
  const items = await safe(
    () => prisma.announcement.findMany({ where: { isPublished: true }, orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }] }),
    []
  );

  return (
    <>
      <PageHeader eyebrow="News" title="Announcements" lead="Stay up to date with the latest from Harvest Club." />
      <div className="container-page max-w-3xl space-y-5 py-14">
        {items.length === 0 && (
          <div className="card border-dashed p-10 text-center text-sm text-[var(--color-muted)]">No announcements at the moment.</div>
        )}
        {items.map((a) => (
          <article key={a.id} className={`card p-6 sm:p-7 ${a.isFeatured ? "border-l-4 border-l-[var(--color-harvest-accent)]" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">
              {a.isFeatured && <span className="badge bg-[var(--color-harvest-accent)]/15 text-[#7a5d16]">Featured</span>}
              {a.category && <span className="badge bg-[var(--color-harvest-blue)]/10 text-[var(--color-harvest-blue)]">{a.category}</span>}
              <time className="ml-auto text-xs text-[var(--color-muted)]">{formatDate(a.createdAt)}</time>
            </div>
            <h2 className="font-display mt-3 text-2xl font-bold">{a.title}</h2>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-[var(--color-muted)]">{a.description}</p>
          </article>
        ))}
      </div>
    </>
  );
}
