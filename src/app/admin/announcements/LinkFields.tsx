"use client";

import { useState } from "react";

type EventOption = { id: string; title: string };

/** Optional "button" for an announcement: pick an event, or type any link. */
export default function LinkFields({
  events,
  initialUrl,
  initialLabel,
}: {
  events: EventOption[];
  initialUrl?: string | null;
  initialLabel?: string | null;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [label, setLabel] = useState(initialLabel ?? "");

  return (
    <fieldset className="space-y-3 rounded-xl border border-dashed border-[var(--color-line)] p-3">
      <legend className="px-1 text-sm font-medium">Button link (optional)</legend>

      {events.length > 0 && (
        <label className="block">
          <span className="field-label">Link to an event</span>
          <select
            value=""
            onChange={(e) => {
              if (!e.target.value) return;
              setUrl(`/events/${e.target.value}`);
              if (!label) setLabel("View event");
            }}
            className="field"
          >
            <option value="">Choose an event…</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </label>
      )}

      <label className="block">
        <span className="field-label">Link</span>
        <input
          name="linkUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/events/… or https://forms.gle/…"
          className="field"
        />
        <span className="mt-1 block text-xs text-[var(--color-muted)]">
          A page on this site (starts with /) or any external link, e.g. a registration form.
        </span>
      </label>

      <label className="block">
        <span className="field-label">Button text</span>
        <input
          name="linkLabel"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={40}
          placeholder="Register now"
          className="field"
        />
      </label>

      {url && (
        <button type="button" onClick={() => { setUrl(""); setLabel(""); }} className="text-sm font-semibold text-red-600 hover:underline">
          Remove link
        </button>
      )}
    </fieldset>
  );
}
