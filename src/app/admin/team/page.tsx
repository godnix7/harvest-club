import Link from "next/link";
import type { Metadata } from "next";
import { prisma, safe, TEAM_CATEGORIES } from "@/lib/site";
import { AdminHeader, Empty, StatusBadge, AdminList, AdminRow, ChipLink } from "../_components/AdminPage";
import { AdminForm, FormPanel, ActionButton, Field, ImageField } from "../_components/controls";
import { saveMember, deleteMember } from "./actions";

export const metadata: Metadata = { title: "Team" };

function linkedinOf(json?: string | null) {
  try { return json ? (JSON.parse(json).linkedin as string | undefined) ?? "" : ""; } catch { return ""; }
}

export default async function AdminTeamPage({ searchParams }: { searchParams: Promise<{ edit?: string; group?: string }> }) {
  const { edit, group } = await searchParams;
  const [members, groups] = await Promise.all([
    safe(() => prisma.teamMember.findMany({ orderBy: [{ category: "asc" }, { orderIndex: "asc" }, { createdAt: "asc" }] }), []),
    safe(() => prisma.teamGroup.findMany({ orderBy: [{ orderIndex: "asc" }, { name: "asc" }] }), []),
  ]);
  const groupName = new Map(groups.map((g) => [g.id, g.name]));
  const editing = edit ? members.find((m) => m.id === edit) : undefined;

  return (
    <div>
      <AdminHeader title="Team" description="Faculty, leadership, wing teams and previous teams shown on the website.">
        <Link href="/admin/team/groups" className="btn-outline">Manage teams / wings</Link>
      </AdminHeader>
      <div className="grid gap-8 xl:grid-cols-3">
        <FormPanel key={editing?.id ?? `new-${group ?? ""}`} title={editing ? "Edit member" : "Add member"} defaultOpen={!!editing || !!group} cancelHref={editing ? "/admin/team" : undefined}>
          {!editing && group && groupName.has(group) && (
            <p className="mb-4 rounded-lg bg-[var(--color-paper)] px-3 py-2 text-sm">
              Adding a member to <strong>{groupName.get(group)}</strong>. <Link href="/admin/team" className="text-[var(--color-harvest-blue)] hover:underline">Clear</Link>
            </p>
          )}
          <AdminForm
            key={editing?.id ?? `new-${group ?? ""}`}
            action={saveMember.bind(null, editing?.id ?? null)}
            submitLabel={editing ? "Save changes" : "Add member"}
            imageField="imageUrl"
            imageFolder="team"
            resetOnSuccess={!editing}
            successRedirect={editing ? "/admin/team" : undefined}
          >
            <Field label="Full name *"><input name="name" required defaultValue={editing?.name} className="field" /></Field>
            <Field label="Position *"><input name="position" required defaultValue={editing?.position} placeholder="e.g. President" className="field" /></Field>
            <Field label="Role group" hint="Leadership = President, Vice President, Secretary… Team member = belongs to a wing below.">
              <select name="category" defaultValue={editing?.category ?? "CORE"} className="field">
                {Object.entries(TEAM_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Team / wing" hint={groups.length ? "For team members, e.g. Web Development or Marketing." : "No wings yet. Create them with “Manage teams / wings”."}>
              <select name="teamGroupId" defaultValue={editing?.teamGroupId ?? (groupName.has(group ?? "") ? group : "") ?? ""} className="field">
                <option value="">— None —</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            <Field label="Department"><input name="department" defaultValue={editing?.department ?? ""} className="field" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tenure" hint="Required for previous teams."><input name="year" defaultValue={editing?.year ?? ""} placeholder="2024-2025" className="field" /></Field>
              <Field label="Display order" hint="Lower shows first."><input type="number" name="orderIndex" defaultValue={editing?.orderIndex ?? 0} className="field" /></Field>
            </div>
            <Field label="Short bio"><textarea name="bio" rows={3} defaultValue={editing?.bio ?? ""} className="field" /></Field>
            <Field label="LinkedIn URL"><input type="url" name="linkedin" defaultValue={linkedinOf(editing?.socialLinks)} placeholder="https://linkedin.com/in/…" className="field" /></Field>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Field label="Email (optional)"><input type="email" name="email" defaultValue={editing?.email ?? ""} placeholder="name@college.edu" className="field" /></Field>
              <Field label="Mobile number (optional)"><input type="tel" name="phone" defaultValue={editing?.phone ?? ""} placeholder="+91 98765 43210" className="field" /></Field>
            </div>
            <p className="-mt-2 text-xs text-[var(--color-muted)]">Email and mobile are shown publicly on the Team page. Leave them blank if the person prefers not to share.</p>
            <ImageField label="Photo" current={editing?.photoUrl} />
          </AdminForm>
        </FormPanel>

        <section className="admin-card !p-0 overflow-hidden xl:col-span-2">
          {members.length === 0 ? (
            <Empty>No team members yet. Add your faculty coordinators and committee first.</Empty>
          ) : (
            <AdminList>
              {members.map((m) => (
                <AdminRow
                  key={m.id}
                  highlight={editing?.id === m.id}
                  title={m.name}
                  badges={
                    <>
                      <StatusBadge tone={m.category === "PREVIOUS" ? "gray" : "green"}>{TEAM_CATEGORIES[m.category]?.split(" (")[0] ?? m.category}</StatusBadge>
                      {m.teamGroupId && groupName.get(m.teamGroupId) && <StatusBadge tone="blue">{groupName.get(m.teamGroupId)}</StatusBadge>}
                    </>
                  }
                  subtitle={`${m.position}${m.year ? ` · ${m.year}` : ""}`}
                  details={[m.email, m.phone].filter(Boolean).join(" · ") || undefined}
                  actions={
                    <>
                      <ChipLink href={`/admin/team?edit=${m.id}`}>Edit</ChipLink>
                      <ActionButton action={deleteMember.bind(null, m.id)} label="Delete" variant="danger" confirmText={`Remove ${m.name} from the team page?`} />
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
