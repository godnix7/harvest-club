import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowRight, Mail, Phone } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { prisma, safe, initials, safeUrl, telHref } from "@/lib/site";
import { getSiteConfig } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the faculty coordinators, leadership, wing teams and resource persons of the club.",
};

export const revalidate = 60;

function linkedin(socialLinks?: string | null) {
  if (!socialLinks) return null;
  try {
    return safeUrl(JSON.parse(socialLinks).linkedin);
  } catch {
    return null;
  }
}

export default async function TeamPage() {
  const [members, groups, config] = await Promise.all([
    safe(
      () =>
        prisma.teamMember.findMany({
          where: { category: { not: "PREVIOUS" } },
          orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
        }),
      []
    ),
    safe(() => prisma.teamGroup.findMany({ orderBy: [{ orderIndex: "asc" }, { name: "asc" }] }), []),
    getSiteConfig(),
  ]);

  type Member = (typeof members)[number];
  type Section = { key: string; title: string; description?: string | null; members: Member[] };

  // Placement: faculty and leadership first; then each wing team; then everyone else.
  const placed = new Set<string>();
  const take = (predicate: (m: Member) => boolean) => {
    const list = members.filter((m) => !placed.has(m.id) && predicate(m));
    list.forEach((m) => placed.add(m.id));
    return list;
  };

  const sections: Section[] = [
    { key: "faculty", title: "Faculty Coordinators", members: take((m) => m.category === "FACULTY") },
    { key: "leadership", title: "Leadership", members: take((m) => m.category === "EXECUTIVE") },
    ...groups.map((g) => ({
      key: g.id,
      title: /team$/i.test(g.name) ? g.name : `${g.name} Team`,
      description: g.description,
      members: take((m) => m.teamGroupId === g.id),
    })),
    { key: "core", title: "Core Team", members: take(() => true) },
  ].filter((s) => s.members.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Our team"
        lead="The faculty and students who lead the club and run its programmes."
      >
        <Link href="/team/previous" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-harvest-green)] hover:underline">
          Previous teams <ArrowRight size={14} />
        </Link>
      </PageHeader>

      <div className="container-page space-y-10 py-10 sm:space-y-16 sm:py-14">
        {sections.length === 0 && (
          <div className="card border-dashed p-10 text-center text-sm text-[var(--color-muted)]">
            Team details will be published soon.
          </div>
        )}
        {sections.map((section) => (
          <section key={section.key} aria-labelledby={`team-${section.key}`}>
            <div className="mb-6 border-b border-[var(--color-line)] pb-3">
              <h2 id={`team-${section.key}`} className="font-display text-2xl font-bold">{section.title}</h2>
              {section.description && <p className="mt-1 text-sm text-[var(--color-muted)]">{section.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {section.members.map((m) => {
                const profile = linkedin(m.socialLinks);
                const showContacts = config.showTeamContacts && (m.email || m.phone);
                return (
                  <article key={m.id} className="card overflow-hidden text-center">
                    <div className="relative aspect-square bg-gradient-soft sm:aspect-[4/3]">
                      {m.photoUrl ? (
                        <Image src={m.photoUrl} alt={m.name} fill sizes="(min-width:1280px) 25vw, (min-width:640px) 33vw, 50vw" className="object-cover" />
                      ) : (
                        <span className="font-display absolute inset-0 flex items-center justify-center text-4xl font-bold text-[var(--color-harvest-blue)]/60">
                          {initials(m.name)}
                        </span>
                      )}
                    </div>
                    <div className="p-3 sm:p-5">
                      <h3 className="font-display text-lg font-bold">{m.name}</h3>
                      <p className="mt-0.5 text-sm font-medium text-[var(--color-harvest-green)]">{m.position}</p>
                      {m.department && <p className="mt-1 text-xs text-[var(--color-muted)]">{m.department}</p>}
                      {m.bio && <p className="mt-3 line-clamp-3 text-sm text-[var(--color-muted)]">{m.bio}</p>}
                      {showContacts && (
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                          {m.email && (
                            <a href={`mailto:${m.email}`} aria-label={`Email ${m.name}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 text-xs font-semibold text-[var(--color-harvest-blue)] hover:border-[var(--color-harvest-blue)]">
                              <Mail size={14} /> Email
                            </a>
                          )}
                          {m.phone && (
                            <a href={telHref(m.phone)} aria-label={`Call ${m.name}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 text-xs font-semibold text-[var(--color-harvest-green-dark)] hover:border-[var(--color-harvest-green)]">
                              <Phone size={14} /> Call
                            </a>
                          )}
                        </div>
                      )}
                      {profile && (
                        <a href={profile} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-[var(--color-harvest-blue)] hover:underline">
                          LinkedIn profile
                        </a>
                      )}
                    </div>
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
