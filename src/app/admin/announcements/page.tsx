import Link from "next/link";
import type { Metadata } from "next";
import { prisma, safe, formatDate } from "@/lib/site";
import { AdminHeader, Empty, StatusBadge } from "../_components/AdminPage";
import { AdminForm, ActionButton, Field } from "../_components/controls";
import LinkFields from "./LinkFields";
import { saveAnnouncement, setPublished, deleteAnnouncement } from "./actions";

export const metadata: Metadata = { title: "Announcements" };

export default async function AdminAnnouncementsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const [items, events] = await Promise.all([
    safe(() => prisma.announcement.findMany({ orderBy: { createdAt: "desc" } }), []),
    safe(() => prisma.event.findMany({ orderBy: { date: "desc" }, take: 50, select: { id: true, title: true } }), []),
  ]);
  const editing = edit ? items.find((a) => a.id === edit) : undefined;

  return (
    <div>
      <AdminHeader title="Announcements" description="Publish news and notices. Drafts stay hidden until published." />
      <div className="grid gap-8 xl:grid-cols-3">
        <section className="admin-card h-fit">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "Edit announcement" : "New announcement"}</h2>
            {editing && <Link href="/admin/announcements" className="text-sm text-[var(--color-harvest-blue)] hover:underline">Cancel</Link>}
          </div>
          <AdminForm
            key={editing?.id ?? "new"}
            action={saveAnnouncement.bind(null, editing?.id ?? null)}
            submitLabel={editing ? "Save changes" : "Publish"}
            resetOnSuccess={!editing}
            successRedirect={editing ? "/admin/announcements" : undefined}
          >
            <Field label="Title *"><input name="title" required defaultValue={editing?.title} className="field" /></Field>
            <Field label="Category" hint="e.g. Event, Registration, General"><input name="category" defaultValue={editing?.category ?? ""} className="field" /></Field>
            <Field label="Message *"><textarea name="description" rows={6} required defaultValue={editing?.description} className="field" /></Field>
            <LinkFields events={events} initialUrl={editing?.linkUrl} initialLabel={editing?.linkLabel} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPublished" defaultChecked={editing ? editing.isPublished : true} className="h-4 w-4 accent-[var(--color-harvest-green)]" />
              Published (visible on the website)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isFeatured" defaultChecked={editing?.isFeatured} className="h-4 w-4 accent-[var(--color-harvest-green)]" />
              Pin as featured
            </label>
          </AdminForm>
        </section>

        <section className="admin-card !p-0 overflow-hidden xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="stack-table min-w-full divide-y divide-[var(--color-line)]">
              <thead className="bg-[var(--color-paper)]">
                <tr><th className="admin-th">Announcement</th><th className="admin-th">Posted</th><th className="admin-th">Status</th><th className="admin-th text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)] max-md:divide-y-0">
                {items.length === 0 && <tr><td colSpan={4}><Empty>No announcements yet.</Empty></td></tr>}
                {items.map((a) => (
                  <tr key={a.id}>
                    <td className="admin-td"><p className="font-medium">{a.title}</p><p className="text-xs text-[var(--color-muted)]">{a.category || "General"}{a.isFeatured && " · Featured"}{a.linkUrl && " · Has link"}</p></td>
                    <td className="admin-td whitespace-nowrap">{formatDate(a.createdAt)}</td>
                    <td className="admin-td"><StatusBadge tone={a.isPublished ? "green" : "amber"}>{a.isPublished ? "Published" : "Draft"}</StatusBadge></td>
                    <td className="admin-td">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 md:justify-end">
                        <Link href={`/admin/announcements?edit=${a.id}`} className="text-sm font-medium text-[var(--color-harvest-blue)] hover:underline">Edit</Link>
                        <ActionButton action={setPublished.bind(null, a.id, !a.isPublished)} label={a.isPublished ? "Unpublish" : "Publish"} />
                        <ActionButton action={deleteAnnouncement.bind(null, a.id)} label="Delete" variant="danger" confirmText="Delete this announcement?" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
