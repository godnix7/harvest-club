"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home, CalendarDays, Users, Image as ImageIcon, Menu, X, Info, Handshake, Megaphone, Mail, ChevronRight,
} from "lucide-react";

const desktopLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Team", href: "/team" },
  { name: "Gallery", href: "/gallery" },
  { name: "Sponsors", href: "/sponsors" },
  { name: "Announcements", href: "/announcements" },
];

const tabs = [
  { name: "Home", href: "/", icon: Home },
  { name: "Events", href: "/events", icon: CalendarDays },
  { name: "Team", href: "/team", icon: Users },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
];

const moreLinks = [
  { name: "About the club", href: "/about", icon: Info },
  { name: "Sponsors & partners", href: "/sponsors", icon: Handshake },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Contact us", href: "/contact", icon: Mail },
];

export default function Navbar({ clubName = "Harvest Club" }: { clubName?: string }) {
  const words = clubName.trim().split(/\s+/);
  const lastWord = words.length > 1 ? words[words.length - 1] : "";
  const firstWords = words.length > 1 ? words.slice(0, -1).join(" ") : clubName;
  const [openPath, setOpenPath] = useState<string | null>(null);
  const pathname = usePathname();
  // The sheet is tied to the page it was opened on, so navigating closes it.
  const sheet = openPath === pathname;
  const setSheet = (open: boolean) => setOpenPath(open ? pathname : null);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const moreActive = moreLinks.some((l) => isActive(l.href));

  // Lock page scroll while the sheet is open.
  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheet]);

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-white/90 backdrop-blur-md">
        <div className="container-page flex h-14 items-center justify-between lg:h-[4.25rem]">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={40} height={40} className="h-9 w-9 object-contain lg:h-10 lg:w-10" priority />
            <span className="text-lg font-extrabold tracking-tight text-[var(--color-harvest-blue-dark)] lg:text-xl">
              <span className="uppercase">{firstWords}</span>{lastWord && <> <span className="uppercase text-[var(--color-harvest-green)]">{lastWord}</span></>}
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? "bg-[var(--color-harvest-green)]/10 text-[var(--color-harvest-green-dark)]"
                    : "text-[var(--color-muted)] hover:bg-gray-50 hover:text-[var(--color-harvest-blue)]"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/contact" className="btn-primary ml-3 !min-h-10 !py-2">Contact Us</Link>
          </nav>

          {/* Phone: quick contact shortcut */}
          <Link href="/contact" className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--color-harvest-green)] px-4 text-sm font-semibold text-white active:scale-95 lg:hidden">
            <Mail size={15} /> Contact
          </Link>
        </div>
      </header>

      {/* Phone: bottom tab bar */}
      <nav
        aria-label="Primary"
        className="site-tabbar fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-line)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto grid h-[4.25rem] max-w-lg grid-cols-5">
          {tabs.map(({ name, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-[var(--color-harvest-green)]" : "text-gray-500"}`}
                >
                  {active && <span className="absolute top-0 h-0.5 w-8 rounded-b bg-[var(--color-harvest-green)]" />}
                  <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
                  {name}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setSheet(!sheet)}
              aria-expanded={sheet}
              aria-controls="more-sheet"
              className={`relative flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold ${sheet || moreActive ? "text-[var(--color-harvest-green)]" : "text-gray-500"}`}
            >
              {sheet ? <X size={22} /> : <Menu size={22} />}
              More
            </button>
          </li>
        </ul>
      </nav>

      {/* Phone: "More" bottom sheet */}
      {sheet && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="More pages">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setSheet(false)} />
          <div id="more-sheet" className="absolute inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] rounded-t-3xl bg-white p-4 shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />
            <ul className="divide-y divide-[var(--color-line)]">
              {moreLinks.map(({ name, href, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="flex min-h-14 items-center gap-4 px-2 text-base font-semibold text-[var(--color-ink)] active:bg-gray-50">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-soft text-[var(--color-harvest-blue)]">
                      <Icon size={20} />
                    </span>
                    <span className="flex-1">{name}</span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
