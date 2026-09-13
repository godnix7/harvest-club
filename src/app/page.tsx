import Image from "next/image";
import Link from "next/link";
import HeroSection from "@/components/ui/HeroSection";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function Home() {
  // @ts-ignore Prisma client might need generation
  let settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  
  if (!settings) {
    settings = {
      id: "global",
      showAboutPreview: true,
      showActivities: true,
      showSponsors: true,
      showCTA: true,
      updatedAt: new Date(),
    };
  }

  // @ts-ignore Prisma client might need generation
  const featuredEvents = await prisma.event.findMany({
    where: { isFeatured: true } as any,
    orderBy: { date: 'desc' },
    take: 3
  });

  const sponsors = await prisma.sponsor.findMany({
    where: { isActive: true }
  });

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <HeroSection />

      {/* About Preview */}
      {settings.showAboutPreview && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="mb-10 lg:mb-0">
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
                  Technology growing from ideas.
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We believe in harnessing the power of modern technology to drive agricultural and sustainable innovation. Our community brings together students from diverse backgrounds to solve real-world challenges.
                </p>
                <Link href="/about" className="text-[var(--color-harvest-green)] font-semibold hover:text-[var(--color-harvest-green-dark)] inline-flex items-center">
                  Learn more about our mission
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>
              </div>
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
                 <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-harvest-green)] to-[var(--color-harvest-blue)] opacity-20 z-10 rounded-2xl"></div>
                 <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <span>[About Image Placeholder]</span>
                 </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What We Do */}
      {settings.showActivities && (
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Featured Events</h2>
              <p className="mt-4 text-lg text-gray-600">Building skills, fostering innovation, and driving change.</p>
            </div>
            {featuredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredEvents.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover-scale transition-transform">
                    {item.coverImage ? (
                      <div className="w-full h-40 relative rounded-lg overflow-hidden mb-4">
                        <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-6">
                        <div className="w-6 h-6 bg-[var(--color-harvest-green)] rounded-full"></div>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 line-clamp-3">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No featured events yet.</div>
            )}
            <div className="text-center mt-12">
              <Link href="/events" className="text-[var(--color-harvest-blue)] font-semibold hover:underline">View all events &rarr;</Link>
            </div>
          </div>
        </section>
      )}

      {/* Sponsors Showcase - Animated Marquee */}
      {settings.showSponsors && sponsors.length > 0 && (
        <section className="py-16 bg-white overflow-hidden border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
            <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Supported By</h2>
          </div>
          <div className="marquee-container">
            <div className="marquee-content">
              {[...sponsors, ...sponsors, ...sponsors].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center w-40 h-20 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                  {item.logoUrl ? (
                    <div className="relative w-full h-full">
                      <Image src={item.logoUrl} alt={item.name} fill className="object-contain" />
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-gray-400">{item.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {settings.showCTA && (
        <section className="bg-[var(--color-harvest-blue-dark)] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">Ready to innovate with us?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join the Harvest Club community and start building the technology of tomorrow.
            </p>
            <Link href="/contact" className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-[var(--color-harvest-blue-dark)] bg-white hover:bg-gray-50 transition-colors">
              Get in Touch
            </Link>
          </div>
        </section>
      )}
      
    </div>
  );
}
