import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CalendarPlus, MapPin } from "lucide-react";
import { prisma, safe, categoryLabel, formatDate, EVENT_STATUSES } from "@/lib/site";

export const revalidate = 60;

type Params = { params: Promise<{ id: string }> };

const getEvent = (id: string) => safe(() => prisma.event.findUnique({ where: { id } }), null);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const event = await getEvent((await params).id);
  return event
    ? { title: event.title, description: event.description.slice(0, 160) }
    : { title: "Event not found" };
}

function lines(text?: string | null) {
  return (text ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

export default async function EventDetailPage({ params }: Params) {
  const event = await getEvent((await params).id);
  if (!event) notFound();

  const highlights = lines(event.highlights);
  const isUpcoming = event.status === "UPCOMING" || event.status === "ONGOING";

  return (
    <>
      <section className="bg-[var(--color-harvest-blue-dark)] text-white">
        <div className="container-page max-w-4xl py-14">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white">
            <ArrowLeft size={16} /> All events
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="badge bg-white/15 text-white">{categoryLabel(event.category)}</span>
            <span className={`badge ${event.status === "CANCELLED" ? "bg-red-500/90" : "bg-[var(--color-harvest-accent)]"} text-white`}>
              {EVENT_STATUSES[event.status] ?? event.status}
            </span>
          </div>
          <h1 className="font-display mt-4 text-4xl font-bold sm:text-5xl">{event.title}</h1>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-blue-100">
            <p className="flex items-center gap-2"><CalendarDays size={18} />{formatDate(event.date, true)}</p>
            <p className="flex items-center gap-2"><MapPin size={18} />{event.venue || "Venue to be announced"}</p>
          </div>
          {isUpcoming && (
            <a href={`/events/${event.id}/calendar`} className="btn mt-7 border border-white/30 text-white hover:bg-white/10">
              <CalendarPlus size={16} /> Add to calendar
            </a>
          )}
        </div>
      </section>

      <section className="container-page max-w-4xl space-y-8 py-12">
        {event.coverImage && (
          <div className="relative aspect-[16/8] overflow-hidden rounded-xl border border-[var(--color-line)]">
            <Image src={event.coverImage} alt={event.title} fill sizes="896px" className="object-cover" priority />
          </div>
        )}

        <div>
          <h2 className="font-display text-2xl font-bold">About this event</h2>
          <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed text-[var(--color-muted)]">{event.description}</p>
        </div>

        {highlights.length > 0 && (
          <div className="card bg-[var(--color-paper)] p-7">
            <h2 className="font-display text-2xl font-bold">Highlights</h2>
            <ul className="mt-4 space-y-2">
              {highlights.map((h, i) => (
                <li key={i} className="flex gap-3 text-[var(--color-ink)]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-harvest-accent)]" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {event.results && (
          <div className="card border-[var(--color-harvest-green)]/30 p-7">
            <h2 className="font-display text-2xl font-bold">Results</h2>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--color-muted)]">{event.results}</p>
          </div>
        )}
      </section>
    </>
  );
}
