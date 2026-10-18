import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DEFAULTS } from "@/lib/settings";
import { AdminHeader } from "../_components/AdminPage";
import { AdminForm, Field } from "../_components/controls";
import { updateSiteSettings } from "./actions";

export const metadata: Metadata = { title: "Site settings" };

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="admin-card">
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="mt-1 mb-4 text-sm text-[var(--color-muted)]">{description}</p>}
      <div className={`space-y-4 ${description ? "" : "mt-4"}`}>{children}</div>
    </section>
  );
}

function Toggle({ name, title, text, checked }: { name: string; title: string; text: string; checked: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-xl p-1">
      <input type="checkbox" name={name} defaultChecked={checked} className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-harvest-green)]" />
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-sm text-[var(--color-muted)]">{text}</span>
      </span>
    </label>
  );
}

export default async function AdminSettingsPage() {
  const admin = await currentAdmin();
  if (admin?.role !== "super") redirect("/admin");

  let s: Awaited<ReturnType<typeof prisma.siteSettings.findUnique>> = null;
  let loadError = false;
  try {
    s = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  } catch (error) {
    console.error(error);
    loadError = true;
  }

  return (
    <div className="max-w-3xl">
      <AdminHeader
        title="Site settings"
        description="Control the wording, contact details and behaviour of the public website. Leave a text box empty to use the built-in default."
      />
      {loadError && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Could not load the saved settings. Check the database connection before saving, or you may overwrite them with blanks.
        </p>
      )}

      <AdminForm action={updateSiteSettings} submitLabel="Save settings" resetOnSuccess={false}>
        <div className="space-y-6">
          <Section title="Branding & homepage" description="The club name appears in the header, footer, browser tab and hero section.">
            <Field label="Club name"><input name="clubName" maxLength={60} defaultValue={s?.clubName ?? ""} placeholder={DEFAULTS.clubName} className="field" /></Field>
            <Field label="Small tagline above the headline"><input name="tagline" maxLength={100} defaultValue={s?.tagline ?? ""} placeholder={DEFAULTS.tagline} className="field" /></Field>
            <Field label="Homepage headline"><input name="heroTitle" maxLength={80} defaultValue={s?.heroTitle ?? ""} placeholder={DEFAULTS.heroTitle} className="field" /></Field>
            <Field label="Homepage intro text"><textarea name="heroSubtitle" rows={3} maxLength={300} defaultValue={s?.heroSubtitle ?? ""} placeholder={DEFAULTS.heroSubtitle} className="field" /></Field>
            <Field label="Footer description"><textarea name="footerText" rows={2} maxLength={300} defaultValue={s?.footerText ?? ""} placeholder={DEFAULTS.footerText} className="field" /></Field>
          </Section>

          <Section title="About page" description="The mission and vision shown on the About page.">
            <Field label="Mission"><textarea name="missionText" rows={4} maxLength={800} defaultValue={s?.missionText ?? ""} placeholder={DEFAULTS.missionText} className="field" /></Field>
            <Field label="Vision"><textarea name="visionText" rows={4} maxLength={800} defaultValue={s?.visionText ?? ""} placeholder={DEFAULTS.visionText} className="field" /></Field>
          </Section>

          <Section title="Contact details" description="Shown on the Contact page and in the footer. Use the club's official details, not a personal number.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact email"><input type="email" name="contactEmail" defaultValue={s?.contactEmail ?? ""} placeholder="club@college.edu" className="field" /></Field>
              <Field label="Contact phone"><input type="tel" name="contactPhone" defaultValue={s?.contactPhone ?? ""} placeholder="+91 98765 43210" className="field" /></Field>
            </div>
            <Field label="Location / address"><input name="location" maxLength={200} defaultValue={s?.location ?? ""} placeholder="Innovation Lab, Engineering Block" className="field" /></Field>
          </Section>

          <Section title="Social media" description="Only the links you fill in are shown in the footer.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="LinkedIn"><input type="url" name="linkedinUrl" defaultValue={s?.linkedinUrl ?? ""} placeholder="https://linkedin.com/company/…" className="field" /></Field>
              <Field label="Instagram"><input type="url" name="instagramUrl" defaultValue={s?.instagramUrl ?? ""} placeholder="https://instagram.com/…" className="field" /></Field>
              <Field label="GitHub"><input type="url" name="githubUrl" defaultValue={s?.githubUrl ?? ""} placeholder="https://github.com/…" className="field" /></Field>
              <Field label="YouTube"><input type="url" name="youtubeUrl" defaultValue={s?.youtubeUrl ?? ""} placeholder="https://youtube.com/@…" className="field" /></Field>
            </div>
          </Section>

          <Section title="Announcement banner" description="A thin strip above the navigation on every page, for time-sensitive news such as “Registrations are open”. Leave empty to hide it.">
            <Field label="Banner text"><input name="bannerText" maxLength={160} defaultValue={s?.bannerText ?? ""} placeholder="She Leads 3.0 registrations are now open" className="field" /></Field>
            <Field label="Banner link (optional)" hint="A page on this site (like /events) or any https:// link."><input name="bannerLink" defaultValue={s?.bannerLink ?? ""} placeholder="/events" className="field" /></Field>
          </Section>

          <Section title="Homepage sections" description="Switch sections on or off without deleting any content.">
            <Toggle name="showAboutPreview" title="“What we do” section" text="Introduction to the club and its three focus areas." checked={s?.showAboutPreview ?? true} />
            <Toggle name="showActivities" title="Featured events" text="Events marked as featured appear in this section." checked={s?.showActivities ?? true} />
            <Toggle name="showSponsors" title="Sponsor strip" text="Scrolling logo strip. Only shown when at least one sponsor is visible." checked={s?.showSponsors ?? true} />
            <Toggle name="showCTA" title="Partner call-to-action" text="Closing banner that links to the Contact page." checked={s?.showCTA ?? true} />
          </Section>

          <Section title="Privacy" description="Controls for personal information on the public site.">
            <Toggle name="showTeamContacts" title="Show team members' email and phone" text="When off, the Email and Call buttons are hidden on the Team page even if details are stored. Turn this off if members do not want their numbers public." checked={s?.showTeamContacts ?? true} />
          </Section>

          <Section title="Maintenance mode" description="Hides the public website behind a notice while you make large changes. The admin area keeps working.">
            <Toggle name="maintenanceMode" title="Put the website into maintenance mode" text="Visitors see the message below instead of the site." checked={s?.maintenanceMode ?? false} />
            <Field label="Message shown to visitors"><textarea name="maintenanceMessage" rows={2} maxLength={300} defaultValue={s?.maintenanceMessage ?? ""} placeholder={DEFAULTS.maintenanceMessage} className="field" /></Field>
          </Section>
        </div>
      </AdminForm>
    </div>
  );
}
