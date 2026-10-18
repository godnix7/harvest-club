import { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/ui/PageHeader";
import { prisma, safe, safeUrl, SPONSOR_TIERS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sponsors & Partners",
  description: "Organisations supporting Harvest Club.",
};

export const revalidate = 60;

export default async function SponsorsPage() {
  const sponsors = await safe(
    () => prisma.sponsor.findMany({ where: { isActive: true }, orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }] }),
    []
  );

  const tiers = SPONSOR_TIERS.map((tier) => ({ tier, items: sponsors.filter((s) => s.tier === tier) })).filter((t) => t.items.length);

  return (
    <>
      <PageHeader
        eyebrow="Partners"
        title="Sponsors & partners"
        lead="We are grateful to the organisations that support our mission and make our events possible."
      />
      <div className="container-page space-y-14 py-14">
        {tiers.length === 0 && (
          <div className="card border-dashed p-10 text-center text-sm text-[var(--color-muted)]">
            Our partner list is being updated.
          </div>
        )}
        {tiers.map(({ tier, items }) => (
          <section key={tier}>
            <h2 className="eyebrow mb-5 border-b border-[var(--color-line)] pb-3">{tier.toLowerCase()} {tier === "PARTNER" ? "partners" : "sponsors"}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => {
                const href = safeUrl(s.websiteUrl);
                return (
                  <article key={s.id} className="card card-hover flex flex-col items-center p-7 text-center">
                    <div className="relative flex h-24 w-full items-center justify-center">
                      {s.logoUrl ? (
                        <Image src={s.logoUrl} alt={`${s.name} logo`} fill sizes="300px" className="object-contain" />
                      ) : (
                        <span className="font-display text-2xl font-bold text-[var(--color-muted)]">{s.name}</span>
                      )}
                    </div>
                    <h3 className="mt-5 font-semibold">
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-harvest-green)] hover:underline">{s.name}</a>
                      ) : s.name}
                    </h3>
                    {s.description && <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{s.description}</p>}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
