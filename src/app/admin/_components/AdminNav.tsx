"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, Image as ImageIcon, Handshake,
  Megaphone, Inbox, Settings, ExternalLink, LogOut, ShieldCheck, UserCog,
} from "lucide-react";

type Item = { href: string; label: string; icon: typeof Users; superOnly?: boolean; adminOnly?: boolean };

const items: Item[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/sponsors", label: "Sponsors", icon: Handshake },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
  { href: "/admin/users", label: "Admin users", icon: ShieldCheck, superOnly: true },
  { href: "/admin/account", label: "My account", icon: UserCog },
];

export default function AdminNav({
  name,
  email,
  role,
  unread,
}: {
  name: string;
  email: string;
  role: "super" | "admin";
  unread: number;
}) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <aside className="flex w-full flex-col bg-[var(--color-harvest-blue-dark)] text-blue-100 sticky top-0 z-30 md:h-screen md:w-64 md:shrink-0">
      <div className="border-b border-white/10 px-5 py-3 md:py-5">
        <p className="font-display text-lg font-bold text-white">Harvest Club</p>
        <p className="text-xs uppercase tracking-widest text-[var(--color-harvest-accent)]">Admin console</p>
        <p className="mt-3 truncate text-sm font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-blue-300">{email}</p>
        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${role === "super" ? "bg-[var(--color-harvest-accent)] text-[var(--color-harvest-blue-dark)]" : "bg-white/15 text-white"}`}>{role === "super" ? "Super admin" : "Admin"}</span>
      </div>

      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col md:overflow-y-auto">
        {items.filter((i) => (i.superOnly ? role === "super" : true)).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active(href) ? "bg-white/12 text-white" : "hover:bg-white/8 hover:text-white"
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
            {href === "/admin/messages" && unread > 0 && (
              <span className="ml-auto rounded-full bg-[var(--color-harvest-accent)] px-2 py-0.5 text-xs font-semibold text-white">{unread}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="hidden space-y-1 border-t border-white/10 p-3 md:block">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/8 hover:text-white">
          <ExternalLink size={18} /> View website
        </Link>
        <form action="/auth/signout" method="post">
          <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/8 hover:text-white">
            <LogOut size={18} /> Sign out
          </button>
        </form>
      </div>
      <div className="flex gap-4 border-t border-white/10 px-5 py-3 text-sm md:hidden">
        <Link href="/" target="_blank">View website</Link>
        <form action="/auth/signout" method="post"><button type="submit">Sign out</button></form>
      </div>
    </aside>
  );
}
