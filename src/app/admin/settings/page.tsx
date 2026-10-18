import type { Metadata } from "next";
import { prisma, safe } from "@/lib/site";
import { AdminHeader } from "../_components/AdminPage";
import { AdminForm } from "../_components/controls";
import { updateSiteSettings } from "./actions";

export const metadata: Metadata = { title: "Site settings" };

const sections = [
  { name: "showAboutPreview", title: "“What we do” section", text: "Introduction to the club and its three focus areas." },
  { name: "showActivities", title: "Featured events", text: "Events marked as featured appear in this homepage section." },
  { name: "showSponsors", title: "Sponsor strip", text: "Scrolling logo strip. Only shown when at least one sponsor is visible." },
  { name: "showCTA", title: "Partner call-to-action", text: "Closing banner that links to the contact page." },
] as const;

export default async function AdminSettingsPage() {
  const settings = await safe(
    () => prisma.siteSettings.findUnique({ where: { id: "global" } }),
    null
  );
  const value = (k: (typeof sections)[number]["name"]) => settings?.[k] ?? true;

  return (
    <div className="max-w-2xl">
      <AdminHeader title="Site settings" description="Choose which sections appear on the public homepage." />
      <div className="admin-card">
        <AdminForm action={updateSiteSettings} submitLabel="Save settings" resetOnSuccess={false}>
          <ul className="divide-y divide-[var(--color-line)]">
            {sections.map((s) => (
              <li key={s.name} className="py-4 first:pt-0">
                <label className="flex cursor-pointer items-start gap-4">
                  <input type="checkbox" name={s.name} defaultChecked={value(s.name)} className="mt-1 h-4 w-4 accent-[var(--color-harvest-green)]" />
                  <span>
                    <span className="block text-sm font-semibold">{s.title}</span>
                    <span className="block text-sm text-[var(--color-muted)]">{s.text}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </AdminForm>
      </div>
    </div>
  );
}
