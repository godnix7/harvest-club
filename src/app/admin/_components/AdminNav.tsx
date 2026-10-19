"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, Image as ImageIcon, Handshake,
  Megaphone, Inbox, Settings, ExternalLink, LogOut, ShieldCheck, UserCog, Menu, X,
} from "lucide-react";

type Item = { href: string; label: string; icon: typeof Users; superOnly?: boolean; settingsOnly?: boolean };

const items: Item[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/sponsors", label: "Sponsors", icon: Handshake },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/settings", label: "Site settings", icon: Settings, settingsOnly: true },
  { href: "/admin/users", label: "Admin users", icon: ShieldCheck, superOnly: true },
  { href: "/admin/account", label: "My account", icon: UserCog },
];

type Props = {
  name: string;
  email: string;
  role: "super" | "admin";
  canEditSettings: boolean;
  unread: number;
};

/** The full menu: profile, every option listed vertically, and footer links. Used by the desktop sidebar and the phone drawer. */
function MenuContent({ name, email, role, canEditSettings, unread, onNavigate }: Props & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const visible = items.filter((i) => (i.superOnly ? role === "super" : i.settingsOnly ? canEditSettings : true));

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="font-display text-lg font-bold text-white">Harvest Club</p>
        <p className="text-xs uppercase tracking-widest text-[var(--color-harvest-accent)]">Admin console</p>
        <p className="mt-3 truncate text-sm font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-blue-300">{email}</p>
        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${role === "super" ? "bg-[var(--color-harvest-accent)] text-[var(--color-harvest-blue-dark)]" : "bg-white/15 text-white"}`}>
          {role === "super" ? "Super admin" : "Admin"}
        </span>
      </div>

      <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto p-3">
        {visible.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active(href) ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active(href) ? "bg-white/15 text-white" : "hover:bg-white/10 hover:text-white"
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

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/10 hover:text-white">
          <ExternalLink size={18} /> View website
        </Link>
        <form action="/auth/signout" method="post">
          <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/10 hover:text-white">
            <LogOut size={18} /> Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminNav(props: Props) {
  const pathname = usePathname();
  // The drawer is tied to the page it was opened on, so navigating closes it.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (value: boolean) => setOpenPath(value ? pathname : null);

  const current =
    items
      .filter((i) => i.href !== "/admin")
      .find((i) => pathname.startsWith(i.href))?.label ?? "Dashboard";

  // Lock page scroll and allow Esc to close while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenPath(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden bg-[var(--color-harvest-blue-dark)] text-blue-100 md:sticky md:top-0 md:block md:h-screen md:w-64 md:shrink-0">
        <MenuContent {...props} />
      </aside>

      {/* Phone: compact top bar + side drawer */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-[var(--color-harvest-blue-dark)] px-3 text-white md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="relative flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10"
        >
          <Menu size={24} />
          {props.unread > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[var(--color-harvest-accent)]" aria-hidden />}
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight">{current}</p>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-harvest-accent)]">Harvest admin</p>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/50" />
          <div id="admin-drawer" className="absolute inset-y-0 left-0 w-[82%] max-w-xs bg-[var(--color-harvest-blue-dark)] text-blue-100 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
            >
              <X size={22} />
            </button>
            <MenuContent {...props} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
