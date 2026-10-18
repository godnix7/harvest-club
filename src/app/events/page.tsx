import { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { EventGrid } from "@/components/ui/EventGrid";
import { prisma, safe } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past events hosted by Harvest Club.",
};

export const revalidate = 60;

export default async function EventsPage() {
  const events = await safe(() => prisma.event.findMany({ orderBy: { date: "asc" } }), []);

  const upcoming = events.filter((e) => e.status === "UPCOMING" || e.status === "ONGOING");
  const past = events.filter((e) => e.status === "COMPLETED" || e.status === "CANCELLED").reverse();

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Events"
        lead="Discover our upcoming activities and browse the archive of past initiatives."
      />
      <div className="container-page space-y-16 py-14">
        <section aria-labelledby="upcoming">
          <h2 id="upcoming" className="font-display mb-6 text-2xl font-bold">Upcoming</h2>
          <EventGrid events={upcoming} emptyText="No upcoming events at the moment. Please check back soon." />
        </section>
        <section aria-labelledby="past">
          <h2 id="past" className="font-display mb-6 text-2xl font-bold">Past events</h2>
          <EventGrid events={past} muted emptyText="Past events will be archived here." />
        </section>
      </div>
    </>
  );
}
