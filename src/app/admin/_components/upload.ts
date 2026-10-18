import { getUploadUrl } from "../upload-actions";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Uploads an image straight to storage and returns its public URL. Throws a readable Error. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be smaller than 5 MB.");
  const presigned = await getUploadUrl(folder, file.name, file.type);
  if ("error" in presigned && presigned.error) throw new Error(presigned.error);
  if (!("url" in presigned) || !presigned.url || !presigned.publicUrl) {
    throw new Error("Failed to prepare the upload.");
  }
  const res = await fetch(presigned.url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!res.ok) throw new Error("Image upload failed. Please try again.");
  return presigned.publicUrl;
}
