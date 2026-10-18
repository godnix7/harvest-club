import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the mission, vision and values of Harvest Club.",
};

const values = [
  { title: "Collaboration", text: "The best ideas grow when engineers, designers and agriculture enthusiasts work together." },
  { title: "Sustainability", text: "We prioritise solutions that are practical, affordable and good for the land." },
  { title: "Learning by doing", text: "Hackathons, workshops and field visits turn classroom knowledge into experience." },
  { title: "Inclusion", text: "Programmes such as She Leads encourage wider participation and leadership in technology." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="About Harvest Club"
        lead="A student community fostering innovation at the intersection of agriculture and technology."
      />

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Our mission</h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--color-muted)]">
              Harvest Club is dedicated to bridging the gap between traditional agriculture and modern
              technology. We empower students to build sustainable, innovative and impactful solutions
              for the future.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold">Our vision</h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--color-muted)]">
              To be the leading student community for agritech innovation — a network of forward-thinking
              individuals who will shape the future of technology and nature.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-[var(--color-paper)]">
        <div className="container-page">
          <p className="eyebrow">Principles</p>
          <h2 className="font-display mt-3 text-3xl font-bold">What we value</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <div key={v.title} className="card flex gap-5 p-6">
                <span className="font-display text-3xl font-bold text-[var(--color-harvest-accent)]">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-xl font-bold">{v.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold">Meet the people behind the club</h2>
            <p className="mt-1 text-[var(--color-muted)]">Faculty coordinators, the executive committee and our core team.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/team" className="btn-primary">Our team</Link>
            <Link href="/events" className="btn-outline">Our events</Link>
          </div>
        </div>
      </section>
    </>
  );
}
