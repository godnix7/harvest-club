import Link from "next/link";
import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { prisma, safe, formatDate } from "@/lib/site";
import { AdminHeader, Empty, StatusBadge } from "../_components/AdminPage";
import { ActionButton } from "../_components/controls";
import { setMessageStatus, deleteMessage } from "./actions";

export const metadata: Metadata = { title: "Messages" };

const filters = [
  { key: "UNREAD", label: "Unread" },
  { key: "READ", label: "Read" },
  { key: "ARCHIVED", label: "Archived" },
  { key: "ALL", label: "All" },
];

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const active = filters.some((f) => f.key === status) ? status! : "UNREAD";

  const [messages, counts] = await Promise.all([
    safe(
      () => prisma.contactMessage.findMany({ where: active === "ALL" ? {} : { status: active }, orderBy: { createdAt: "desc" }, take: 200 }),
      []
    ),
    safe(() => prisma.contactMessage.groupBy({ by: ["status"], _count: true }), []),
  ]);
  const countOf = (k: string) => k === "ALL" ? counts.reduce((n, c) => n + c._count, 0) : counts.find((c) => c.status === k)?._count ?? 0;

  return (
    <div>
      <AdminHeader title="Messages" description="Enquiries submitted through the website contact form." />

      <nav aria-label="Filter messages" className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/admin/messages?status=${f.key}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${active === f.key ? "border-[var(--color-harvest-green)] bg-[var(--color-harvest-green)] text-white" : "border-[var(--color-line)] bg-white text-[var(--color-muted)] hover:border-[var(--color-harvest-green)]"}`}
          >
            {f.label} <span className="opacity-70">({countOf(f.key)})</span>
          </Link>
        ))}
      </nav>

      <div className="space-y-3">
        {messages.length === 0 && <div className="admin-card"><Empty>No messages in this view.</Empty></div>}
        {messages.map((m) => (
          <details key={m.id} className="admin-card group !p-0">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${m.status === "UNREAD" ? "bg-[var(--color-harvest-accent)]" : "bg-transparent"}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm"><span className="font-semibold">{m.name}</span> <span className="text-[var(--color-muted)]">· {m.subject || "No subject"}</span></p>
                <p className="truncate text-xs text-[var(--color-muted)]">{m.message}</p>
              </div>
              <StatusBadge tone={m.status === "UNREAD" ? "amber" : m.status === "READ" ? "green" : "gray"}>{m.status.toLowerCase()}</StatusBadge>
              <time className="hidden shrink-0 text-xs text-[var(--color-muted)] sm:block">{formatDate(m.createdAt)}</time>
            </summary>
            <div className="border-t border-[var(--color-line)] px-5 py-5">
              <p className="text-sm text-[var(--color-muted)]">From <a className="font-medium text-[var(--color-ink)] hover:underline" href={`mailto:${m.email}`}>{m.email}</a></p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
              <div className="mt-5 flex flex-wrap items-center gap-5">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "Your message to Harvest Club"))}`}
                  className="btn-primary !py-2"
                >
                  <Mail size={14} /> Reply by email
                </a>
                {m.status !== "READ" && <ActionButton action={setMessageStatus.bind(null, m.id, "READ")} label="Mark as read" />}
                {m.status !== "UNREAD" && <ActionButton action={setMessageStatus.bind(null, m.id, "UNREAD")} label="Mark as unread" />}
                {m.status !== "ARCHIVED" && <ActionButton action={setMessageStatus.bind(null, m.id, "ARCHIVED")} label="Archive" />}
                <ActionButton action={deleteMessage.bind(null, m.id)} label="Delete" variant="danger" confirmText="Permanently delete this message?" />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
