import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { prisma, safe } from "@/lib/site";
import { AdminHeader, Empty } from "../../_components/AdminPage";
import { AdminForm, ActionButton, Field } from "../../_components/controls";
import { saveGroup, deleteGroup } from "./actions";

export const metadata: Metadata = { title: "Teams / wings" };

export default async function TeamGroupsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const [groups, counts] = await Promise.all([
    safe(() => prisma.teamGroup.findMany({ orderBy: [{ orderIndex: "asc" }, { name: "asc" }] }), []),
    safe(() => prisma.teamMember.groupBy({ by: ["teamGroupId"], _count: true }), []),
  ]);
  const editing = edit ? groups.find((g) => g.id === edit) : undefined;
  const countOf = (id: string) => counts.find((c) => c.teamGroupId === id)?._count ?? 0;

  return (
    <div>
      <AdminHeader title="Teams / wings" description="Create sections such as Web Development, Marketing or Design. Each one appears as its own section on the Team page.">
        <Link href="/admin/team" className="btn-outline"><ArrowLeft size={15} /> Back to members</Link>
      </AdminHeader>

      <div className="grid gap-8 xl:grid-cols-3">
        <section className="admin-card h-fit">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "Edit team" : "Add team"}</h2>
            {editing && <Link href="/admin/team/groups" className="text-sm text-[var(--color-harvest-blue)] hover:underline">Cancel</Link>}
          </div>
          <AdminForm
            key={editing?.id ?? "new"}
            action={saveGroup.bind(null, editing?.id ?? null)}
            submitLabel={editing ? "Save changes" : "Add team"}
            resetOnSuccess={!editing}
            successRedirect={editing ? "/admin/team/groups" : undefined}
          >
            <Field label="Team name *"><input name="name" required maxLength={80} defaultValue={editing?.name} placeholder="e.g. Web Development" className="field" /></Field>
            <Field label="Short description"><textarea name="description" rows={2} defaultValue={editing?.description ?? ""} className="field" /></Field>
            <Field label="Display order" hint="Lower numbers appear first on the Team page."><input type="number" name="orderIndex" defaultValue={editing?.orderIndex ?? 0} className="field" /></Field>
          </AdminForm>
          <p className="mt-4 text-xs text-[var(--color-muted)]">After creating a team, assign people to it from the member form using “Team / wing”.</p>
        </section>

        <section className="admin-card !p-0 overflow-hidden xl:col-span-2">
          <ul className="divide-y divide-[var(--color-line)]">
            {groups.length === 0 && <li><Empty>No teams yet. Add your first one.</Empty></li>}
            {groups.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-medium">{g.name} <span className="text-xs font-normal text-[var(--color-muted)]">· order {g.orderIndex}</span></p>
                  <p className="text-xs text-[var(--color-muted)]">{countOf(g.id)} member{countOf(g.id) === 1 ? "" : "s"}{g.description ? ` · ${g.description}` : ""}</p>
                </div>
                <div className="flex items-center gap-5">
                  <Link href={`/admin/team/groups?edit=${g.id}`} className="text-sm font-medium text-[var(--color-harvest-blue)] hover:underline">Edit</Link>
                  <ActionButton action={deleteGroup.bind(null, g.id)} label="Delete" variant="danger" confirmText={`Delete the “${g.name}” team? Its members stay on the site but are no longer assigned to a team.`} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
