import type { Metadata } from "next";
import { prisma, safe, formatDate } from "@/lib/site";
import { AdminHeader, Empty, StatusBadge, AdminList, AdminRow, ChipLink } from "../_components/AdminPage";
import { AdminForm, FormPanel, ActionButton, Field } from "../_components/controls";
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
        <FormPanel key={editing?.id ?? "new"} title={editing ? "Edit announcement" : "New announcement"} defaultOpen={!!editing} cancelHref={editing ? "/admin/announcements" : undefined}>
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
        </FormPanel>

        <section className="admin-card !p-0 overflow-hidden xl:col-span-2">
          {items.length === 0 ? (
            <Empty>No announcements yet.</Empty>
          ) : (
            <AdminList>
              {items.map((a) => (
                <AdminRow
                  key={a.id}
                  highlight={editing?.id === a.id}
                  title={a.title}
                  badges={
                    <>
                      <StatusBadge tone={a.isPublished ? "green" : "amber"}>{a.isPublished ? "Published" : "Draft"}</StatusBadge>
                      {a.isFeatured && <StatusBadge tone="blue">Featured</StatusBadge>}
                    </>
                  }
                  subtitle={`${a.category || "General"} · ${formatDate(a.createdAt, true)}`}
                  details={a.linkUrl ? `Button: ${a.linkLabel || "Learn more"} → ${a.linkUrl}` : undefined}
                  actions={
                    <>
                      <ChipLink href={`/admin/announcements?edit=${a.id}`}>Edit</ChipLink>
                      <ActionButton action={setPublished.bind(null, a.id, !a.isPublished)} label={a.isPublished ? "Unpublish" : "Publish"} />
                      <ActionButton action={deleteAnnouncement.bind(null, a.id)} label="Delete" variant="danger" confirmText="Delete this announcement?" />
                    </>
                  }
                />
              ))}
            </AdminList>
          )}
        </section>
      </div>
    </div>
  );
}
