import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { categoryLabel, formatDate } from "@/lib/site";

type EventItem = {
  id: string;
  title: string;
  date: string | Date;
  category: string;
  description: string;
  venue?: string | null;
  status?: string;
  coverImage?: string | null;
};

/**
 * Phones: compact horizontal cards (thumbnail left) so more events fit on screen.
 * Tablet/desktop: image-on-top card grid.
 */
export function EventGrid({
  events,
  emptyText,
  muted = false,
  swipe = false,
}: {
  events: EventItem[];
  emptyText: string;
  muted?: boolean;
  /** Render as a horizontal swipe row on phones (used on the homepage). */
  swipe?: boolean;
}) {
  if (events.length === 0) {
    return (
      <div className="card border-dashed p-8 text-center text-sm text-[var(--color-muted)]">{emptyText}</div>
    );
  }

  const cards = events.map((event) => (
    <Link key={event.id} href={`/events/${event.id}`} className="group block">
      <article
        className={`card card-hover flex h-full overflow-hidden ${swipe ? "flex-col" : "sm:flex-col"} ${muted ? "bg-[var(--color-paper)]" : ""}`}
      >
        <div
          className={`relative shrink-0 overflow-hidden bg-gradient-soft ${
            swipe ? "h-40 w-full" : "h-auto w-28 sm:h-44 sm:w-full"
          }`}
        >
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt=""
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 112px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--color-harvest-green)]/40">
              <CalendarDays size={36} />
            </div>
          )}
          {event.status === "CANCELLED" && (
            <span className="badge absolute left-2 top-2 bg-red-600 text-white">Cancelled</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <span className="badge mb-2 w-fit bg-[var(--color-harvest-blue)]/10 text-[var(--color-harvest-blue)]">
            {categoryLabel(event.category)}
          </span>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-[var(--color-ink)] group-hover:text-[var(--color-harvest-green)] sm:text-lg">
            {event.title}
          </h3>
          <p className={`mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)] ${swipe ? "" : "hidden sm:block"}`}>
            {event.description}
          </p>
          <div className="mt-auto space-y-1 pt-3 text-xs font-medium text-[var(--color-muted)]">
            <p className="flex items-center gap-1.5"><CalendarDays size={13} className="text-[var(--color-harvest-green)]" />{formatDate(event.date)}</p>
            {event.venue && <p className="flex items-center gap-1.5 truncate"><MapPin size={13} className="text-[var(--color-harvest-green)]" />{event.venue}</p>}
          </div>
        </div>
      </article>
    </Link>
  ));

  return swipe ? (
    <div className="snap-row">{cards}</div>
  ) : (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">{cards}</div>
  );
}
