import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { AnimatedList } from "@/components/ui/AnimatedList";

export const metadata: Metadata = {
  title: "Sponsors | Harvest Club",
  description: "Partners and sponsors supporting Harvest Club.",
};

// Next.js config for caching and revalidation
export const revalidate = 60; // revalidate every 60 seconds

export default async function SponsorsPage() {
  const sponsors = await prisma.sponsor.findMany({
    where: { isActive: true },
    orderBy: [
      { orderIndex: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  const validSponsors = sponsors || [];

  const groupedSponsors = validSponsors.reduce((acc, sponsor) => {
    if (!acc[sponsor.tier]) acc[sponsor.tier] = [];
    acc[sponsor.tier].push(sponsor);
    return acc;
  }, {} as Record<string, typeof validSponsors>);

  const tierOrder = ["TITLE", "PLATINUM", "GOLD", "SILVER", "PARTNER"];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Sponsors & Partners</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We are immensely grateful to the organizations that support our mission and make our events possible.
          </p>
        </div>

        {validSponsors.length === 0 && (
          <div className="text-gray-500 py-12">
            Our sponsorship portfolio is currently being updated.
          </div>
        )}

        {tierOrder.map(tier => {
          const sponsorsInTier = groupedSponsors[tier];
          if (!sponsorsInTier || sponsorsInTier.length === 0) return null;

          return (
            <div key={tier} className="mb-16 last:mb-0">
              <h2 className="text-2xl font-bold text-[var(--color-harvest-blue-dark)] mb-8 capitalize">
                {tier.toLowerCase()} Sponsors
              </h2>
              <AnimatedList className="flex flex-wrap justify-center gap-8">
                {sponsorsInTier.map(sponsor => (
                  <div key={sponsor.id} className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-shadow hover-scale max-w-sm w-full flex flex-col items-center">
                    <div className="w-32 h-32 relative bg-white rounded-xl shadow-inner overflow-hidden flex items-center justify-center mb-6 grayscale hover:grayscale-0 transition-all p-4 border border-gray-100">
                      {sponsor.logoUrl ? (
                        <Image src={sponsor.logoUrl} alt={sponsor.name} fill className="object-contain p-2" sizes="128px" />
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">{sponsor.name.charAt(0)}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                      {sponsor.websiteUrl ? (
                        <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-harvest-green)] transition-colors">
                          {sponsor.name}
                        </a>
                      ) : sponsor.name}
                    </h3>
                    {sponsor.description && (
                      <p className="text-gray-500 text-center text-sm">{sponsor.description}</p>
                    )}
                  </div>
                ))}
              </AnimatedList>
            </div>
          );
        })}

      </div>
    </div>
  );
}
