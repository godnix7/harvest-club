"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin";
import { uploadImage } from "./upload";

/** Generic row action button (delete / toggle) with confirmation, busy state and error display. */
export function ActionButton({
  action,
  label,
  confirmText,
  variant = "link",
}: {
  action: () => Promise<ActionResult>;
  label: string;
  confirmText?: string;
  variant?: "link" | "danger";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirmText && !window.confirm(confirmText)) return;
          setError(null);
          start(async () => {
            const result = await action();
            if (result.error) setError(result.error);
            else router.refresh();
          });
        }}
        className={
          variant === "danger"
            ? "text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
            : "text-sm font-medium text-[var(--color-harvest-blue)] hover:underline disabled:opacity-50"
        }
      >
        {pending ? "Working…" : label}
      </button>
      {error && <span className="mt-1 text-xs text-red-600">{error}</span>}
    </span>
  );
}

/**
 * Wraps a create/update server action in a form: busy state, single-submit guard,
 * optional image upload (file input named `imageFile` → fills `imageField`), status messages.
 */
export function AdminForm({
  action,
  children,
  submitLabel,
  imageField,
  imageFolder,
  resetOnSuccess = true,
  successRedirect,
}: {
  action: (fd: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  submitLabel: string;
  imageField?: string;
  imageFolder?: string;
  resetOnSuccess?: boolean;
  successRedirect?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const fd = new FormData(form);
      const file = fd.get("imageFile");
      if (imageField && imageFolder && file instanceof File && file.size > 0) {
        fd.set(imageField, await uploadImage(file, imageFolder));
      }
      fd.delete("imageFile");
      const result = await action(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        if (resetOnSuccess) form.reset();
        if (successRedirect) router.push(successRedirect);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && !error && <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">Saved successfully.</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

export function ImageField({ label = "Image", current }: { label?: string; current?: string | null }) {
  return (
    <fieldset className="space-y-2 rounded-lg border border-dashed border-[var(--color-line)] p-3">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      {current && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="" className="h-20 w-auto rounded border border-[var(--color-line)] object-cover" />
      )}
      <input type="file" name="imageFile" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-paper)] file:px-3 file:py-2 file:text-sm file:font-semibold" />
      <input type="url" name="imageUrl" defaultValue={current ?? ""} placeholder="…or paste an image URL (https://)" className="field" />
      <p className="text-xs text-[var(--color-muted)]">JPG, PNG, WebP, GIF or SVG · max 5 MB. An uploaded file takes priority over the URL.</p>
    </fieldset>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[var(--color-muted)]">{hint}</span>}
    </label>
  );
}
