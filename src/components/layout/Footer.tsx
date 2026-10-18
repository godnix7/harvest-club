import Link from "next/link";
import Image from "next/image";
import { getSiteConfig } from "@/lib/settings";
import { telHref } from "@/lib/site";

const cols = [
  { title: "Explore", links: [["About", "/about"], ["Events", "/events"], ["Team", "/team"], ["Gallery", "/gallery"]] },
  { title: "Community", links: [["Sponsors & Partners", "/sponsors"], ["Announcements", "/announcements"], ["Contact", "/contact"]] },
];

export default async function Footer() {
  const c = await getSiteConfig();
  const words = c.clubName.trim().split(/\s+/);
  const last = words.length > 1 ? words[words.length - 1] : "";
  const first = words.length > 1 ? words.slice(0, -1).join(" ") : c.clubName;

  return (
    <footer className="mt-auto bg-gradient-harvest text-blue-100">
      <div className="container-page grid gap-8 py-10 sm:py-14 md:grid-cols-4 md:gap-10">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full bg-white p-0.5 object-contain" />
            <span className="text-lg font-extrabold uppercase tracking-tight text-white">
              {first} {last && <span className="text-[var(--color-harvest-accent)]">{last}</span>}
            </span>
          </Link>
          <p className="mt-4 max-w-sm whitespace-pre-line text-sm leading-relaxed text-blue-200">{c.footerText}</p>
          {c.social.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {c.social.map((s) => (
                <li key={s.label}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center rounded-full border border-white/25 px-4 text-sm font-medium hover:bg-white/10">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-2">
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">{col.title}</h3>
              <ul className="mt-3 space-y-1 text-sm">
                {col.links.map(([n, h]) => (
                  <li key={h}><Link href={h} className="inline-block py-1.5 hover:text-white">{n}</Link></li>
                ))}
                {col.title === "Community" && c.contactEmail && (
                  <li><a href={`mailto:${c.contactEmail}`} className="inline-block break-all py-1.5 hover:text-white">{c.contactEmail}</a></li>
                )}
                {col.title === "Community" && c.contactPhone && (
                  <li><a href={telHref(c.contactPhone)} className="inline-block py-1.5 hover:text-white">{c.contactPhone}</a></li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-4 text-xs text-blue-300">
          &copy; {new Date().getFullYear()} {c.clubName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
