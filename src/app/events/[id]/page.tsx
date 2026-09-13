import Link from "next/link";
import { notFound } from "next/navigation";

// Mock data until Prisma is setup and connected
const mockEvents = [
  {
    id: "1",
    title: "She Leads 3.0",
    date: "2026-10-15T09:00:00Z",
    venue: "Main Auditorium, Campus",
    category: "HACKATHON",
    status: "UPCOMING",
    description: "Our premier hackathon focusing on agritech innovation and female leadership in tech. Join us for 48 hours of intense coding, mentoring, and building the future.",
    highlights: "Keynote by industry leaders, ₹50,000 prize pool, Internship opportunities."
  },
  {
    id: "2",
    title: "AI in Agriculture Workshop",
    date: "2026-09-20T14:00:00Z",
    venue: "Lab 4B",
    category: "WORKSHOP",
    status: "UPCOMING",
    description: "Learn how machine learning models are being deployed to monitor crop health. This hands-on workshop covers basic CNNs for leaf disease detection.",
    highlights: "Practical coding session, Certificate of participation, take-home project."
  }
];

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = mockEvents.find(e => e.id === id);

  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Event Hero */}
      <section className="bg-[var(--color-harvest-blue-dark)] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/events" className="inline-flex items-center text-blue-200 hover:text-white mb-8 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Events
          </Link>
          
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-800 text-blue-100 mb-4 border border-blue-700">
            {event.category}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
          
          <div className="flex flex-wrap gap-6 text-blue-100 mt-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {event.venue || "TBA"}
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-4">About Event</h2>
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {event.highlights && (
            <div className="bg-green-50 rounded-2xl shadow-sm border border-green-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-harvest-green-dark)] mb-4">Highlights</h2>
              <p className="text-gray-800 leading-relaxed">
                {event.highlights}
              </p>
            </div>
          )}
          
        </div>
      </section>
    </div>
  );
}
