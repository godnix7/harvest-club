import type { Metadata } from "next";
import { prisma, safe, SPONSOR_TIERS } from "@/lib/site";
import { AdminHeader, Empty, StatusBadge, AdminList, AdminRow, ChipLink } from "../_components/AdminPage";
import { AdminForm, FormPanel, ActionButton, Field, ImageField } from "../_components/controls";
import { saveSponsor, setSponsorActive, deleteSponsor } from "./actions";

export const metadata: Metadata = { title: "Sponsors" };

export default async function AdminSponsorsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const sponsors = await safe(
    () => prisma.sponsor.findMany({ orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }] }),
    []
  );
  const editing = edit ? sponsors.find((s) => s.id === edit) : undefined;

  return (
    <div>
      <AdminHeader title="Sponsors" description="Manage sponsor tiers, logos and visibility on the website." />
      <div className="grid gap-8 xl:grid-cols-3">
        <FormPanel key={editing?.id ?? "new"} title={editing ? "Edit sponsor" : "Add sponsor"} defaultOpen={!!editing} cancelHref={editing ? "/admin/sponsors" : undefined}>
          <AdminForm
            key={editing?.id ?? "new"}
            action={saveSponsor.bind(null, editing?.id ?? null)}
            submitLabel={editing ? "Save changes" : "Add sponsor"}
            imageField="imageUrl"
            imageFolder="sponsors"
            resetOnSuccess={!editing}
            successRedirect={editing ? "/admin/sponsors" : undefined}
          >
            <Field label="Organisation name *"><input name="name" required defaultValue={editing?.name} className="field" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tier">
                <select name="tier" defaultValue={editing?.tier ?? "PARTNER"} className="field">
                  {SPONSOR_TIERS.map((t) => <option key={t} value={t}>{t[0] + t.slice(1).toLowerCase()}</option>)}
                </select>
              </Field>
              <Field label="Display order"><input type="number" name="orderIndex" defaultValue={editing?.orderIndex ?? 0} className="field" /></Field>
            </div>
            <Field label="Website"><input type="url" name="websiteUrl" defaultValue={editing?.websiteUrl ?? ""} placeholder="https://" className="field" /></Field>
            <Field label="Description"><textarea name="description" rows={3} defaultValue={editing?.description ?? ""} className="field" /></Field>
            <ImageField label="Logo" current={editing?.logoUrl} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={editing ? editing.isActive : true} className="h-4 w-4 accent-[var(--color-harvest-green)]" />
              Visible on the website
            </label>
          </AdminForm>
        </FormPanel>

        <section className="admin-card !p-0 overflow-hidden xl:col-span-2">
          {sponsors.length === 0 ? (
            <Empty>No sponsors yet.</Empty>
          ) : (
            <AdminList>
              {sponsors.map((s) => (
                <AdminRow
                  key={s.id}
                  highlight={editing?.id === s.id}
                  title={s.name}
                  badges={
                    <>
                      <StatusBadge tone="blue">{s.tier[0] + s.tier.slice(1).toLowerCase()}</StatusBadge>
                      <StatusBadge tone={s.isActive ? "green" : "gray"}>{s.isActive ? "Visible" : "Hidden"}</StatusBadge>
                    </>
                  }
                  subtitle={s.websiteUrl || undefined}
                  actions={
                    <>
                      <ChipLink href={`/admin/sponsors?edit=${s.id}`}>Edit</ChipLink>
                      <ActionButton action={setSponsorActive.bind(null, s.id, !s.isActive)} label={s.isActive ? "Hide" : "Show"} />
                      <ActionButton action={deleteSponsor.bind(null, s.id)} label="Delete" variant="danger" confirmText={`Remove ${s.name}?`} />
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
