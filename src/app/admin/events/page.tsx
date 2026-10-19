import Link from "next/link";
import type { Metadata } from "next";
import { prisma, safe, formatDate, toDateTimeLocal, categoryLabel, EVENT_CATEGORIES, EVENT_STATUSES } from "@/lib/site";
import { AdminHeader, Empty, StatusBadge, AdminList, AdminRow, ChipLink } from "../_components/AdminPage";
import { AdminForm, FormPanel, ActionButton, Field, ImageField } from "../_components/controls";
import { saveEvent, deleteEvent, toggleFeatured } from "./actions";

export const metadata: Metadata = { title: "Events" };

const tone = { UPCOMING: "green", ONGOING: "blue", COMPLETED: "gray", CANCELLED: "red" } as const;


export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const events = await safe(() => prisma.event.findMany({ orderBy: { date: "desc" } }), []);
  const editing = edit ? events.find((e) => e.id === edit) : undefined;

  return (
    <div>
      <AdminHeader title="Events" description="Create and manage hackathons, workshops, seminars and visits." />

      <div className="grid gap-8 xl:grid-cols-3">
        <FormPanel key={editing?.id ?? "new"} title={editing ? "Edit event" : "Add event"} defaultOpen={!!editing} cancelHref={editing ? "/admin/events" : undefined}>
          <AdminForm
            key={editing?.id ?? "new"}
            action={saveEvent.bind(null, editing?.id ?? null)}
            submitLabel={editing ? "Save changes" : "Create event"}
            imageField="imageUrl"
            imageFolder="events"
            resetOnSuccess={!editing}
            successRedirect={editing ? "/admin/events" : undefined}
          >
            <Field label="Title *"><input name="title" required defaultValue={editing?.title} className="field" /></Field>
            <Field label="Date & time *"><input type="datetime-local" name="date" required defaultValue={editing ? toDateTimeLocal(editing.date) : ""} className="field" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select name="category" defaultValue={editing?.category ?? "WORKSHOP"} className="field">
                  {Object.entries(EVENT_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={editing?.status ?? "UPCOMING"} className="field">
                  {Object.entries(EVENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Venue"><input name="venue" defaultValue={editing?.venue ?? ""} placeholder="e.g. Seminar Hall, Block A or Online" className="field" /></Field>
            <Field label="Description *"><textarea name="description" rows={4} required defaultValue={editing?.description} className="field" /></Field>
            <Field label="Highlights" hint="One highlight per line."><textarea name="highlights" rows={3} defaultValue={editing?.highlights ?? ""} className="field" /></Field>
            <Field label="Results / outcome" hint="Shown on the event page, typically after it is completed."><textarea name="results" rows={3} defaultValue={editing?.results ?? ""} className="field" /></Field>
            <ImageField label="Cover image" current={editing?.coverImage} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isFeatured" defaultChecked={editing?.isFeatured} className="h-4 w-4 accent-[var(--color-harvest-green)]" />
              Feature on the homepage
            </label>
          </AdminForm>
        </FormPanel>

        <section className="admin-card !p-0 overflow-hidden xl:col-span-2">
          {events.length === 0 ? (
            <Empty>No events yet. Use the form to create your first one.</Empty>
          ) : (
            <AdminList>
              {events.map((e) => (
                <AdminRow
                  key={e.id}
                  highlight={editing?.id === e.id}
                  title={<Link href={`/events/${e.id}`} target="_blank" className="hover:underline">{e.title}</Link>}
                  badges={
                    <>
                      <StatusBadge tone={tone[e.status as keyof typeof tone] ?? "gray"}>{EVENT_STATUSES[e.status] ?? e.status}</StatusBadge>
                      {e.isFeatured && <StatusBadge tone="amber">Featured</StatusBadge>}
                    </>
                  }
                  subtitle={`${categoryLabel(e.category)} · ${formatDate(e.date, true)}`}
                  actions={
                    <>
                      <ChipLink href={`/admin/events?edit=${e.id}`}>Edit</ChipLink>
                      <ActionButton action={toggleFeatured.bind(null, e.id, !e.isFeatured)} label={e.isFeatured ? "Unfeature" : "Feature"} />
                      <ActionButton action={deleteEvent.bind(null, e.id)} label="Delete" variant="danger" confirmText={`Delete “${e.title}”? This cannot be undone.`} />
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
