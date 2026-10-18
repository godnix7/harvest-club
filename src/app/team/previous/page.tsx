import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { prisma, safe } from "@/lib/site";

export const metadata: Metadata = {
  title: "Previous Teams",
  description: "Past leaders and members of Harvest Club.",
};

export const revalidate = 60;

export default async function PreviousTeamsPage() {
  const members = await safe(
    () =>
      prisma.teamMember.findMany({
        where: { category: "PREVIOUS" },
        orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
      }),
    []
  );

  const byYear = new Map<string, typeof members>();
  for (const m of members) {
    const year = m.year || "Earlier";
    byYear.set(year, [...(byYear.get(year) ?? []), m]);
  }
  const years = [...byYear.keys()].sort().reverse();

  return (
    <>
      <PageHeader eyebrow="Archive" title="Previous teams" lead="Honouring the leaders and members who built Harvest Club.">
        <Link href="/team" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-harvest-green)] hover:underline">
          <ArrowLeft size={14} /> Current team
        </Link>
      </PageHeader>

      <div className="container-page max-w-3xl space-y-10 py-14">
        {years.length === 0 && (
          <div className="card border-dashed p-10 text-center text-sm text-[var(--color-muted)]">
            Previous team records will be added soon.
          </div>
        )}
        {years.map((year) => (
          <section key={year}>
            <h2 className="font-display mb-4 text-2xl font-bold text-[var(--color-harvest-green-dark)]">{year}</h2>
            <ul className="card divide-y divide-[var(--color-line)] overflow-hidden">
              {byYear.get(year)!.map((m) => (
                <li key={m.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold">{m.name}</span>
                  <span className="badge bg-[var(--color-harvest-green)]/10 text-[var(--color-harvest-green-dark)]">{m.position}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
