"use client";

import { useState } from "react";
import { Mail, MapPin, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const location = process.env.NEXT_PUBLIC_CLUB_LOCATION;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setStatus("idle");

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Failed to send message.");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        lead="Questions about our events, or interested in sponsoring or collaborating? We would be glad to hear from you."
      />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-5">
        <aside className="space-y-6 lg:col-span-2">
          <h2 className="font-display text-2xl font-bold">Reach the club</h2>
          <p className="leading-relaxed text-[var(--color-muted)]">
            We welcome enquiries from students, faculty, industry professionals and prospective partners.
            We aim to respond within a few working days.
          </p>
          {email && (
            <p className="flex items-start gap-3">
              <Mail size={20} className="mt-0.5 text-[var(--color-harvest-green)]" />
              <a href={`mailto:${email}`} className="font-medium hover:underline">{email}</a>
            </p>
          )}
          {location && (
            <p className="flex items-start gap-3">
              <MapPin size={20} className="mt-0.5 text-[var(--color-harvest-green)]" />
              <span>{location}</span>
            </p>
          )}
        </aside>

        <div className="card p-6 sm:p-8 lg:col-span-3">
          {status === "success" ? (
            <div role="status" className="py-8 text-center">
              <CheckCircle2 size={40} className="mx-auto text-[var(--color-harvest-green)]" />
              <h2 className="font-display mt-4 text-2xl font-bold">Message sent</h2>
              <p className="mt-2 text-[var(--color-muted)]">Thank you for contacting us. We will get back to you soon.</p>
              <button type="button" onClick={() => setStatus("idle")} className="btn-outline mt-6">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="field-label">Name *</label>
                  <input id="name" name="name" required minLength={2} maxLength={100} autoComplete="name" className="field" />
                </div>
                <div>
                  <label htmlFor="email" className="field-label">Email *</label>
                  <input id="email" name="email" type="email" required autoComplete="email" className="field" />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="field-label">Subject</label>
                <input id="subject" name="subject" maxLength={150} className="field" />
              </div>
              <div>
                <label htmlFor="message" className="field-label">Message *</label>
                <textarea id="message" name="message" rows={6} required minLength={10} maxLength={2000} className="field" />
              </div>
              {/* Honeypot field – hidden from real users */}
              <div className="hidden" aria-hidden="true">
                <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>

              {status === "error" && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
                {isSubmitting ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
