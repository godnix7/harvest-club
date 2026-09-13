import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AnimatedList } from "@/components/ui/AnimatedList";

export const metadata: Metadata = {
  title: "Announcements | Harvest Club",
  description: "Latest news and announcements from Harvest Club.",
};

// Next.js config for caching and revalidation
export const revalidate = 60;

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: [
      { isFeatured: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  const validAnnouncements = announcements || [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="mb-12 border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Announcements</h1>
          <p className="text-lg text-gray-600">Stay up to date with the latest from Harvest Club.</p>
        </div>

        <AnimatedList className="space-y-6">
          {validAnnouncements.map(announcement => (
            <div 
              key={announcement.id} 
              className={`bg-white/70 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border p-6 sm:p-8 hover-scale hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]
                ${announcement.isFeatured ? 'border-[var(--color-harvest-green)]/30 ring-1 ring-[var(--color-harvest-green)] ring-opacity-20' : 'border-white/40'}
              `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  {announcement.isFeatured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--color-harvest-green)] to-[var(--color-harvest-green-dark)] text-white shadow-sm">
                      Featured
                    </span>
                  )}
                  {announcement.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[var(--color-harvest-blue)] border border-blue-100">
                      {announcement.category}
                    </span>
                  )}
                </div>
                <time className="text-sm font-medium text-gray-400">
                  {new Date(announcement.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{announcement.title}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{announcement.description}</p>
            </div>
          ))}

          {validAnnouncements.length === 0 && (
            <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
              No new announcements.
            </div>
          )}
        </AnimatedList>
        
      </div>
    </div>
  );
}
