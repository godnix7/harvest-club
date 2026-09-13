import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Harvest Club",
  description: "Learn about the mission, vision, and history of Harvest Club.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-[var(--color-harvest-green)] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Harvest Club</h1>
          <p className="text-xl max-w-2xl mx-auto text-green-100">
            Fostering innovation and driving change through technology and agricultural advancement.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Harvest Club is dedicated to bridging the gap between traditional agriculture and modern technology. 
              We aim to empower students to build sustainable, innovative, and impactful solutions for the future.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-harvest-blue-dark)] mb-6 border-b pb-4">Our Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              To be the leading student community for agritech innovation, creating a network of forward-thinking 
              individuals who will shape the future of technology and nature.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Our Philosophy</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We believe that the best ideas grow in a collaborative environment. By bringing together diverse 
              talents—from engineering to design, and business to agriculture—we cultivate an ecosystem where 
              innovation thrives. <strong>Technology growing from ideas.</strong>
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
