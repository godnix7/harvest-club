"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, CheckCircle2 } from "lucide-react";

const web3Key = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

/** Sends the message to the developer via Web3Forms. Returns true on success; never throws. */
async function sendToWeb3Forms(data: Record<string, FormDataEntryValue>): Promise<boolean> {
  if (!web3Key) return false;
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: web3Key,
        subject: String(data.subject || "").trim() || "New message from the Harvest Club website",
        from_name: "Harvest Club Website",
        name: data.name,
        email: data.email,
        message: data.message,
        botcheck: data.website ? "1" : "",
      }),
    });
    const result = await res.json().catch(() => ({}));
    return res.ok && result.success === true;
  } catch {
    return false;
  }
}

export default function ContactForm({
  email,
  phone,
  location,
}: {
  email: string | null;
  phone: string | null;
  location: string | null;
}) {
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

    const payload = Object.fromEntries(fd);
    try {
      // 1) Save to our database so the message appears in the admin Messages inbox.
      let saved = false;
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json().catch(() => ({}));
        if (res.ok) saved = true;
        // Validation / rate-limit errors (4xx) are final: show them and stop.
        else if (res.status >= 400 && res.status < 500) throw new Error(result.error || "Failed to send message.");
      } catch (err) {
        if (err instanceof Error && err.message !== "Failed to fetch" && !/NetworkError|Load failed/i.test(err.message)) throw err;
      }

      // 2) Email the developer through Web3Forms (must be sent from the browser on the free plan).
      const emailed = await sendToWeb3Forms(payload);

      if (!saved && !emailed) {
        throw new Error("Sorry, we could not send your message right now. Please try again in a few minutes.");
      }
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
      <div className="container-page grid gap-8 py-8 sm:gap-12 sm:py-14 lg:grid-cols-5">
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
          {phone && (
            <p className="flex items-start gap-3">
              <Phone size={20} className="mt-0.5 text-[var(--color-harvest-green)]" />
              <a href={`tel:${phone.replace(/[^d+]/g, "")}`} className="font-medium hover:underline">{phone}</a>
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
