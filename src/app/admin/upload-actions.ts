"use server";

import { guard } from "@/lib/admin";
import { generateUploadUrl } from "@/lib/storage";

const FOLDERS = ["events", "sponsors", "team", "gallery"];
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function getUploadUrl(folder: string, filename: string, contentType: string) {
  const denied = await guard();
  if (denied) return denied;
  if (!FOLDERS.includes(folder)) return { error: "Invalid upload folder." };
  if (!TYPES.includes(contentType)) return { error: "Only JPG, PNG, WebP, GIF or SVG images are allowed." };
  if (!process.env.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID.startsWith("your_")) {
    return { error: "Image storage is not configured yet. Paste an image URL instead." };
  }

  try {
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_").slice(-80);
    const key = `${folder}/${Date.now()}-${safeName}`;
    const result = await generateUploadUrl(key, contentType);
    return { url: result.uploadUrl, publicUrl: result.publicUrl };
  } catch (error) {
    console.error(error);
    return { error: "Could not prepare the upload. Check the storage configuration." };
  }
}
