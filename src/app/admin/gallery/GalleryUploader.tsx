"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EVENT_CATEGORIES } from "@/lib/categories";
import { uploadImage } from "../_components/upload";
import { addGalleryImage } from "./actions";

export default function GalleryUploader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const category = String(fd.get("category"));
    const caption = String(fd.get("caption") ?? "");
    const urlInput = String(fd.get("imageUrl") ?? "").trim();
    const files = (fd.getAll("files") as File[]).filter((f) => f.size > 0);

    if (files.length === 0 && !urlInput) {
      setError("Choose at least one photo or paste an image URL.");
      return;
    }

    setBusy(true);
    setError(null);
    const failures: string[] = [];
    try {
      if (urlInput) {
        const r = await addGalleryImage(urlInput, category, caption);
        if (r.error) failures.push(r.error);
      }
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading ${i + 1} of ${files.length}…`);
        try {
          const url = await uploadImage(files[i], "gallery");
          const r = await addGalleryImage(url, category, files.length === 1 ? caption : "");
          if (r.error) failures.push(`${files[i].name}: ${r.error}`);
        } catch (err) {
          failures.push(`${files[i].name}: ${err instanceof Error ? err.message : "failed"}`);
        }
      }
      if (failures.length) setError(failures.join("\n"));
      else form.reset();
      router.refresh();
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="field-label">Photos</span>
        <input type="file" name="files" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-paper)] file:px-3 file:py-2 file:text-sm file:font-semibold" />
        <span className="mt-1 block text-xs text-[var(--color-muted)]">You can select several photos at once · max 12 MB each (large photos are shrunk automatically).</span>
      </label>
      <label className="block">
        <span className="field-label">…or image URL</span>
        <input type="url" name="imageUrl" placeholder="https://" className="field" />
      </label>
      <label className="block">
        <span className="field-label">Category</span>
        <select name="category" defaultValue="OTHER" className="field">
          {Object.entries(EVENT_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="field-label">Caption</span>
        <input name="caption" maxLength={200} placeholder="Applied when uploading a single photo" className="field" />
      </label>
      {error && <p role="alert" className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? progress || "Uploading…" : "Add to gallery"}</button>
    </form>
  );
}
