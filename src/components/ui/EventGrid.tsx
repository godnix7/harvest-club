"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

type Event = {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  coverImage?: string | null;
};

export function EventGrid({ events, isUpcoming }: { events: Event[], isUpcoming: boolean }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (events.length === 0) {
    return (
      <div className="glass p-8 rounded-xl border border-gray-200 text-center text-gray-500">
        No {isUpcoming ? "upcoming" : "past"} events at the moment. Stay tuned!
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {events.map((event) => (
        <motion.div key={event.id} variants={item} whileHover={{ y: -5 }} className="h-full">
          <Link href={`/events/${event.id}`} className="block h-full outline-none group">
            <div className={`rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all h-full flex flex-col ${isUpcoming ? 'glass-card group-hover:shadow-md' : 'bg-white/40 opacity-80 group-hover:opacity-100'}`}>
              
              <div className={`relative flex items-center justify-center overflow-hidden ${isUpcoming ? 'h-48 bg-gray-100' : 'h-40 bg-gray-50'}`}>
                {event.coverImage ? (
                  <Image src={event.coverImage} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-blue-50 opacity-50"></div>
                )}
                
                {isUpcoming && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[var(--color-harvest-blue)] shadow-sm">
                    {event.category}
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-grow flex flex-col relative z-10 bg-white/50">
                <p className={`text-sm font-semibold mb-2 ${isUpcoming ? 'text-[var(--color-harvest-green)]' : 'text-gray-500'}`}>
                  {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <h3 className={`font-bold mb-2 transition-colors ${isUpcoming ? 'text-xl text-gray-900 group-hover:text-[var(--color-harvest-blue-dark)]' : 'text-lg text-gray-800'}`}>
                  {event.title}
                </h3>
                {isUpcoming && (
                  <p className="text-gray-600 line-clamp-3 text-sm">
                    {event.description}
                  </p>
                )}
              </div>

            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
