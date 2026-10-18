import Link from "next/link";
import type { Metadata } from "next";
import { prisma, safe, TEAM_CATEGORIES } from "@/lib/site";
import { AdminHeader, Empty, StatusBadge } from "../_components/AdminPage";
import { AdminForm, ActionButton, Field, ImageField } from "../_components/controls";
import { saveMember, deleteMember } from "./actions";

export const metadata: Metadata = { title: "Team" };

function linkedinOf(json?: string | null) {
  try { return json ? (JSON.parse(json).linkedin as string | undefined) ?? "" : ""; } catch { return ""; }
}

export default async function AdminTeamPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const members = await safe(
    () => prisma.teamMember.findMany({ orderBy: [{ category: "asc" }, { orderIndex: "asc" }, { createdAt: "asc" }] }),
    []
  );
  const editing = edit ? members.find((m) => m.id === edit) : undefined;

  return (
    <div>
      <AdminHeader title="Team" description="Faculty coordinators, committee members and previous teams shown on the website." />
      <div className="grid gap-8 xl:grid-cols-3">
        <section className="admin-card h-fit">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "Edit member" : "Add member"}</h2>
            {editing && <Link href="/admin/team" className="text-sm text-[var(--color-harvest-blue)] hover:underline">Cancel</Link>}
          </div>
          <AdminForm
            key={editing?.id ?? "new"}
            action={saveMember.bind(null, editing?.id ?? null)}
            submitLabel={editing ? "Save changes" : "Add member"}
            imageField="imageUrl"
            imageFolder="team"
            resetOnSuccess={!editing}
            successRedirect={editing ? "/admin/team" : undefined}
          >
            <Field label="Full name *"><input name="name" required defaultValue={editing?.name} className="field" /></Field>
            <Field label="Position *"><input name="position" required defaultValue={editing?.position} placeholder="e.g. President" className="field" /></Field>
            <Field label="Group">
              <select name="category" defaultValue={editing?.category ?? "CORE"} className="field">
                {Object.entries(TEAM_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Department"><input name="department" defaultValue={editing?.department ?? ""} className="field" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tenure" hint="Required for previous teams."><input name="year" defaultValue={editing?.year ?? ""} placeholder="2024-2025" className="field" /></Field>
              <Field label="Display order" hint="Lower shows first."><input type="number" name="orderIndex" defaultValue={editing?.orderIndex ?? 0} className="field" /></Field>
            </div>
            <Field label="Short bio"><textarea name="bio" rows={3} defaultValue={editing?.bio ?? ""} className="field" /></Field>
            <Field label="LinkedIn URL"><input type="url" name="linkedin" defaultValue={linkedinOf(editing?.socialLinks)} placeholder="https://linkedin.com/in/…" className="field" /></Field>
            <ImageField label="Photo" current={editing?.photoUrl} />
          </AdminForm>
        </section>

        <section className="admin-card !p-0 overflow-hidden xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="stack-table min-w-full divide-y divide-[var(--color-line)]">
              <thead className="bg-[var(--color-paper)]">
                <tr><th className="admin-th">Name</th><th className="admin-th">Group</th><th className="admin-th">Order</th><th className="admin-th text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)] max-md:divide-y-0">
                {members.length === 0 && <tr><td colSpan={4}><Empty>No team members yet. Add your faculty coordinators and committee first.</Empty></td></tr>}
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="admin-td"><p className="font-medium">{m.name}</p><p className="text-xs text-[var(--color-muted)]">{m.position}{m.year ? ` · ${m.year}` : ""}</p></td>
                    <td className="admin-td"><StatusBadge tone={m.category === "PREVIOUS" ? "gray" : "green"}>{TEAM_CATEGORIES[m.category] ?? m.category}</StatusBadge></td>
                    <td className="admin-td">{m.orderIndex}</td>
                    <td className="admin-td">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 md:justify-end">
                        <Link href={`/admin/team?edit=${m.id}`} className="text-sm font-medium text-[var(--color-harvest-blue)] hover:underline">Edit</Link>
                        <ActionButton action={deleteMember.bind(null, m.id)} label="Delete" variant="danger" confirmText={`Remove ${m.name} from the team page?`} />
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
