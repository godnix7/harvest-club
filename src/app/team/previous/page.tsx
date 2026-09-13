import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Previous Teams | Harvest Club",
  description: "Historical rosters of Harvest Club.",
};

const mockPrevious = [
  { id: "p1", name: "Amit Singh", position: "President", year: "2024-2025" },
  { id: "p2", name: "Sneha Reddy", position: "Technical Lead", year: "2024-2025" },
];

export default function PreviousTeamsPage() {
  // Group by year
  const groupedByYear = mockPrevious.reduce((acc, curr) => {
    if (!acc[curr.year]) acc[curr.year] = [];
    acc[curr.year].push(curr);
    return acc;
  }, {} as Record<string, typeof mockPrevious>);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <Link href="/team" className="inline-flex items-center text-gray-500 hover:text-[var(--color-harvest-blue)] mb-8 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Current Team
        </Link>
        
        <div className="mb-12 border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Historical Teams</h1>
          <p className="text-lg text-gray-600">Honoring the leaders and members who built Harvest Club.</p>
        </div>

        {Object.entries(groupedByYear).map(([year, members]) => (
          <div key={year} className="mb-12">
            <h2 className="text-2xl font-bold text-[var(--color-harvest-green-dark)] mb-6">{year}</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {members.map(member => (
                  <li key={member.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{member.name}</p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
                        {member.position}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
        
      </div>
    </div>
  );
}
