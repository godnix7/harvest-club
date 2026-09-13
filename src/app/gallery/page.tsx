import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | Harvest Club",
  description: "Explore photos from Harvest Club events, hackathons, and workshops.",
};

const mockImages = [
  { id: "1", url: "", category: "HACKATHON", caption: "She Leads opening ceremony" },
  { id: "2", url: "", category: "WORKSHOP", caption: "Students working on IoT sensors" },
  { id: "3", url: "", category: "INDUSTRIAL_VISIT", caption: "Vertical farming facility" },
  { id: "4", url: "", category: "HACKATHON", caption: "Prize distribution" },
];

export default function GalleryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Gallery</h1>
          <p className="text-lg text-gray-600">A visual journey through our activities and events.</p>
        </div>

        {/* Categories (Static for now) */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-100 pb-6">
          <button className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--color-harvest-green)] text-white">All</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Hackathons</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Workshops</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Visits</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {mockImages.map((img, idx) => (
            <div key={idx} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover-scale">
              {/* Placeholder */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span className="text-xs uppercase tracking-wider">{img.category}</span>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white text-sm font-medium truncate">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
