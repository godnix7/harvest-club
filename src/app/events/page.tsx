import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { EventGrid } from "@/components/ui/EventGrid";

export const metadata: Metadata = {
  title: "Events | Harvest Club",
  description: "Upcoming and previous events hosted by Harvest Club.",
};

export const revalidate = 60; // Cache for 60 seconds

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' }
  });

  const allEvents = events || [];

  const upcomingEvents = allEvents.filter(e => e.status === "UPCOMING" || e.status === "ONGOING");
  const pastEvents = allEvents.filter(e => e.status === "COMPLETED" || e.status === "CANCELLED").reverse();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="mb-12 border-b border-gray-200 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Events Archive</h1>
          <p className="text-lg text-gray-600 max-w-2xl">Discover our upcoming activities and explore our past initiatives.</p>
        </div>

        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-harvest-blue-dark)] mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-gradient-to-b from-[var(--color-harvest-green)] to-[var(--color-harvest-green-dark)] rounded-full"></span>
            Upcoming Events
          </h2>
          
          <EventGrid events={upcomingEvents} isUpcoming={true} />
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-gray-400 rounded-full"></span>
            Past Events
          </h2>
          
          <EventGrid events={pastEvents} isUpcoming={false} />
        </section>
      </div>
    </div>
  );
}
