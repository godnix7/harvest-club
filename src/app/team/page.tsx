import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team | Harvest Club",
  description: "Meet the faculty coordinators, executive committee, and core team of Harvest Club.",
};

const mockTeam = [
  { id: "1", name: "Dr. A. Sharma", position: "Faculty Coordinator", department: "Computer Science", category: "FACULTY" },
  { id: "2", name: "Priya Patel", position: "President", department: "Information Technology", category: "EXECUTIVE" },
  { id: "3", name: "Rahul Kumar", position: "Vice President", department: "Electronics", category: "EXECUTIVE" },
  { id: "4", name: "Neha Singh", position: "Technical Lead", department: "Computer Science", category: "CORE" },
];

export default function TeamPage() {
  const faculty = mockTeam.filter(m => m.category === "FACULTY");
  const executives = mockTeam.filter(m => m.category === "EXECUTIVE");
  const core = mockTeam.filter(m => m.category === "CORE");

  const TeamSection = ({ title, members }: { title: string, members: typeof mockTeam }) => (
    <div className="mb-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {members.map(member => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-center hover:shadow-md transition-shadow">
            <div className="h-48 bg-gray-200 w-full relative">
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  [Photo]
               </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
              <p className="text-[var(--color-harvest-green)] font-medium text-sm mt-1">{member.position}</p>
              <p className="text-gray-500 text-sm mt-2">{member.department}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="flex justify-between items-end mb-12 border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h1>
            <p className="text-lg text-gray-600">The dedicated individuals driving innovation at Harvest Club.</p>
          </div>
          <Link href="/team/previous" className="text-[var(--color-harvest-blue)] hover:text-[var(--color-harvest-blue-dark)] font-medium inline-flex items-center">
            Previous Teams
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>

        {faculty.length > 0 && <TeamSection title="Faculty Coordinators" members={faculty} />}
        {executives.length > 0 && <TeamSection title="Executive Committee" members={executives} />}
        {core.length > 0 && <TeamSection title="Core Team" members={core} />}

      </div>
    </div>
  );
}
