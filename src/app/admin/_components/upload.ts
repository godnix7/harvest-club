export const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // accepted from the user before shrinking
const MAX_DIMENSION = 1600;

/** Shrinks large photos in the browser so uploads are fast and fit the server limit. */
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file; // keep GIF/SVG untouched
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

/** Uploads an image through the site's own server and returns its public URL. Throws a readable Error. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be smaller than 12 MB.");
  const prepared = await shrink(file);

  const body = new FormData();
  body.set("file", prepared);
  body.set("folder", folder);

  let res: Response;
  try {
    res = await fetch("/api/admin/upload", { method: "POST", body });
  } catch {
    throw new Error("Could not reach the server to upload the image. Check your connection or paste an image link instead.");
  }
  const result = await res.json().catch(() => ({}));
  if (!res.ok || !result.url) throw new Error(result.error || "Image upload failed. Please try again or paste an image link instead.");
  return result.url as string;
}
