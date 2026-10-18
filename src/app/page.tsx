import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Users, Lightbulb, Handshake } from "lucide-react";
import HeroSection from "@/components/ui/HeroSection";
import { EventGrid } from "@/components/ui/EventGrid";
import { prisma, safe, formatDate, safeUrl } from "@/lib/site";

export const revalidate = 60;

const startOfYesterday = () => new Date(Date.now() - 24 * 60 * 60 * 1000);

const pillars = [
  { icon: Lightbulb, title: "Innovation", text: "Hackathons and project showcases where students turn agritech ideas into working prototypes." },
  { icon: Users, title: "Learning", text: "Workshops and seminars led by faculty, alumni and industry practitioners." },
  { icon: Handshake, title: "Partnerships", text: "Industrial visits and sponsor collaborations that connect classrooms to the field." },
];

export default async function Home() {
  const defaults = { showAboutPreview: true, showActivities: true, showSponsors: true, showCTA: true };
  const settings = await safe(
    async () => (await prisma.siteSettings.findUnique({ where: { id: "global" } })) ?? defaults,
    defaults
  );

  const [featured, upcoming, sponsors, announcements, counts] = await Promise.all([
    safe(() => prisma.event.findMany({ where: { isFeatured: true }, orderBy: { date: "desc" }, take: 3 }), []),
    safe(() => prisma.event.findMany({ where: { status: { in: ["UPCOMING", "ONGOING"] }, date: { gte: startOfYesterday() } }, orderBy: { date: "asc" }, take: 1 }), []),
    safe(() => prisma.sponsor.findMany({ where: { isActive: true }, orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }] }), []),
    safe(() => prisma.announcement.findMany({ where: { isPublished: true }, orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }], take: 3 }), []),
    safe(async () => ({
      events: await prisma.event.count(),
      completed: await prisma.event.count({ where: { status: "COMPLETED" } }),
      sponsors: await prisma.sponsor.count({ where: { isActive: true } }),
    }), { events: 0, completed: 0, sponsors: 0 }),
  ]);

  const stats = [
    { label: "Events organised", value: counts.completed },
    { label: "Total events", value: counts.events },
    { label: "Partners", value: counts.sponsors },
  ].filter((s) => s.value > 0);

  const next = upcoming[0];

  return (
    <>
      <HeroSection stats={stats} />

      {next && (
        <section className="border-b border-[var(--color-line)] bg-white">
          <div className="container-page flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-3 text-sm text-[var(--color-ink)]">
              <Calendar size={18} className="text-[var(--color-harvest-green)]" />
              <span><span className="font-semibold">Next event:</span> {next.title} · {formatDate(next.date)}</span>
            </p>
            <Link href={`/events/${next.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-harvest-green)] hover:underline">
              Event details <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {settings.showAboutPreview && (
        <section className="section">
          <div className="container-page">
            <div className="max-w-2xl">
              <p className="eyebrow">What we do</p>
              <h2 className="font-display mt-3 text-3xl font-bold text-[var(--color-ink)] sm:text-4xl">
                Bridging agriculture and modern technology
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[var(--color-muted)]">
                Harvest Club empowers students to build sustainable, impactful solutions by combining
                technical skill with an understanding of real agricultural challenges.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {pillars.map(({ icon: Icon, title, text }) => (
                <div key={title} className="card p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-green text-white shadow-md shadow-green-900/20">
                    <Icon size={20} />
                  </span>
                  <h3 className="font-display mt-4 text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{text}</p>
                </div>
              ))}
            </div>
            <Link href="/about" className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-harvest-green)] hover:underline">
              Learn more about our mission <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {settings.showActivities && (
        <section className="section bg-[var(--color-paper)]">
          <div className="container-page">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Highlights</p>
                <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">Featured events</h2>
              </div>
              <Link href="/events" className="hidden items-center gap-1 text-sm font-semibold text-[var(--color-harvest-green)] hover:underline sm:inline-flex">
                All events <ArrowRight size={14} />
              </Link>
            </div>
            <EventGrid swipe events={featured} emptyText="Featured events will appear here soon." />
          </div>
        </section>
      )}

      {announcements.length > 0 && (
        <section className="section">
          <div className="container-page">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="eyebrow">News</p>
                <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">Latest announcements</h2>
              </div>
              <Link href="/announcements" className="text-sm font-semibold text-[var(--color-harvest-green)] hover:underline">View all</Link>
            </div>
            <ul className="divide-y divide-[var(--color-line)] rounded-xl border border-[var(--color-line)]">
              {announcements.map((a) => (
                <li key={a.id} className="flex flex-col gap-1 p-5 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">{a.title}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-[var(--color-muted)]">{a.description}</p>
                  </div>
                  <time className="shrink-0 text-xs text-[var(--color-muted)]">{formatDate(a.createdAt)}</time>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {settings.showSponsors && sponsors.length > 0 && (
        <section className="border-y border-[var(--color-line)] py-14">
          <p className="eyebrow mb-8 text-center">Supported by</p>
          <div className="marquee">
            {[0, 1].map((copy) => (
              <div key={copy} className="marquee-track" aria-hidden={copy === 1}>
                {sponsors.map((s) => {
                  const href = safeUrl(s.websiteUrl);
                  const inner = s.logoUrl ? (
                    <span className="relative block h-14 w-36">
                      <Image src={s.logoUrl} alt={s.name} fill sizes="144px" className="object-contain" />
                    </span>
                  ) : (
                    <span className="font-display text-xl font-bold text-[var(--color-muted)]">{s.name}</span>
                  );
                  return href ? (
                    <a key={s.id} href={href} target="_blank" rel="noopener noreferrer" tabIndex={copy === 1 ? -1 : 0} className="opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0">{inner}</a>
                  ) : (
                    <span key={s.id} className="opacity-70">{inner}</span>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      )}

      {settings.showCTA && (
        <section className="section">
          <div className="container-page">
            <div className="rounded-3xl bg-gradient-harvest px-6 py-12 text-center text-white sm:px-16 sm:py-16">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Partner with Harvest Club</h2>
              <p className="mx-auto mt-4 max-w-xl text-blue-100">
                Whether you want to sponsor an event, mentor students or collaborate on a project, we would be glad to hear from you.
              </p>
              <Link href="/contact" className="btn mt-8 w-full bg-white !min-h-12 text-[var(--color-harvest-blue-dark)] hover:bg-blue-50 sm:w-auto">
                Get in touch <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
