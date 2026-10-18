import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, Users, Handshake, Image as ImageIcon, Inbox, Megaphone, ArrowRight } from "lucide-react";
import { prisma, safe, formatDate, categoryLabel } from "@/lib/site";
import { AdminHeader, Empty } from "./_components/AdminPage";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [counts, upcoming, messages] = await Promise.all([
    safe(async () => {
      const [events, upcomingEvents, team, gallery, sponsors, announcements, unread] = await Promise.all([
        prisma.event.count(),
        prisma.event.count({ where: { status: { in: ["UPCOMING", "ONGOING"] } } }),
        prisma.teamMember.count(),
        prisma.galleryImage.count(),
        prisma.sponsor.count({ where: { isActive: true } }),
        prisma.announcement.count({ where: { isPublished: true } }),
        prisma.contactMessage.count({ where: { status: "UNREAD" } }),
      ]);
      return { events, upcomingEvents, team, gallery, sponsors, announcements, unread };
    }, null),
    safe(() => prisma.event.findMany({ where: { status: { in: ["UPCOMING", "ONGOING"] } }, orderBy: { date: "asc" }, take: 5 }), []),
    safe(() => prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }), []),
  ]);

  const cards = counts && [
    { label: "Upcoming events", value: counts.upcomingEvents, sub: `${counts.events} total`, href: "/admin/events", icon: CalendarDays },
    { label: "Unread messages", value: counts.unread, sub: "from the contact form", href: "/admin/messages", icon: Inbox },
    { label: "Team members", value: counts.team, sub: "current & previous", href: "/admin/team", icon: Users },
    { label: "Active sponsors", value: counts.sponsors, sub: "shown on website", href: "/admin/sponsors", icon: Handshake },
    { label: "Gallery photos", value: counts.gallery, sub: "published", href: "/admin/gallery", icon: ImageIcon },
    { label: "Announcements", value: counts.announcements, sub: "published", href: "/admin/announcements", icon: Megaphone },
  ];

  return (
    <div>
      <AdminHeader title="Dashboard" description="An overview of your website content and enquiries." />

      {!cards ? (
        <div className="admin-card border-amber-200 bg-amber-50 text-sm text-amber-900">
          The database could not be reached, so live figures are unavailable. Check <code>DATABASE_URL</code> and try again.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ label, value, sub, href, icon: Icon }) => (
            <Link key={label} href={href} className="admin-card flex items-center gap-4 transition hover:border-[var(--color-harvest-green)]/50 hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-harvest-green)]/10 text-[var(--color-harvest-green)]">
                <Icon size={22} />
              </span>
              <div>
                <p className="text-sm text-[var(--color-muted)]">{label}</p>
                <p className="font-display text-3xl font-bold leading-tight">{value}</p>
                <p className="text-xs text-[var(--color-muted)]">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="admin-card !p-0">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
            <h2 className="font-semibold">Upcoming events</h2>
            <Link href="/admin/events" className="inline-flex items-center gap-1 text-sm text-[var(--color-harvest-green)] hover:underline">Manage <ArrowRight size={14} /></Link>
          </div>
          {upcoming.length === 0 ? <Empty>No upcoming events. <Link href="/admin/events" className="text-[var(--color-harvest-green)] underline">Create one</Link>.</Empty> : (
            <ul className="divide-y divide-[var(--color-line)]">
              {upcoming.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-[var(--color-muted)]">{categoryLabel(e.category)}</p>
                  </div>
                  <time className="shrink-0 text-xs text-[var(--color-muted)]">{formatDate(e.date)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-card !p-0">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
            <h2 className="font-semibold">Recent messages</h2>
            <Link href="/admin/messages" className="inline-flex items-center gap-1 text-sm text-[var(--color-harvest-green)] hover:underline">Inbox <ArrowRight size={14} /></Link>
          </div>
          {messages.length === 0 ? <Empty>No messages yet.</Empty> : (
            <ul className="divide-y divide-[var(--color-line)]">
              {messages.map((m) => (
                <li key={m.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">
                      {m.status === "UNREAD" && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--color-harvest-accent)]" aria-label="unread" />}
                      {m.name}
                    </p>
                    <time className="shrink-0 text-xs text-[var(--color-muted)]">{formatDate(m.createdAt)}</time>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">{m.subject || m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
