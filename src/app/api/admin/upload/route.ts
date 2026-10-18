import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentAdmin } from "@/lib/session";

export const runtime = "nodejs";

const FOLDERS = ["events", "sponsors", "team", "gallery"];
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};
// Vercel serverless functions accept ~4.5 MB request bodies; the browser shrinks photos first.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await currentAdmin())) {
    return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
  if (!url || !serviceKey || url.includes("your-project")) {
    return NextResponse.json(
      { error: "Image storage is not set up yet (missing SUPABASE_SERVICE_ROLE_KEY). Paste an image link instead." },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!FOLDERS.includes(folder)) return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Only JPG, PNG, WebP, GIF or SVG images are allowed." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be smaller than 4 MB." }, { status: 413 });

  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { error } = await supabase.storage.from(bucket).upload(key, await file.arrayBuffer(), {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    console.error("Storage upload failed:", error.message);
    const hint = /bucket/i.test(error.message)
      ? `Storage bucket “${bucket}” was not found. Create a public bucket with that name in Supabase.`
      : "Could not store the image. Please try again or paste an image link instead.";
    return NextResponse.json({ error: hint }, { status: 502 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  return NextResponse.json({ url: data.publicUrl });
}
