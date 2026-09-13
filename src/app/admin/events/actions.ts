"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

import { generateUploadUrl as getStorageUploadUrl } from "@/lib/storage";

export async function createEvent(formData: FormData) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;
  const category = formData.get("category") as string;
  const status = formData.get("status") as string;
  const coverImage = formData.get("coverImage") as string;
  const isFeatured = formData.get("isFeatured") === "true";

  if (!title || !date) {
    return { error: "Title and Date are required" };
  }

  try {
    // @ts-ignore Prisma types might not be updated until user restarts dev server
    await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        category,
        status,
        coverImage: coverImage || null,
        isFeatured,
      } as any
    });

    revalidatePath("/events");
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteEvent(id: string) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.event.delete({
      where: { id }
    });

    revalidatePath("/admin/events");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getEventPresignedUrl(filename: string, contentType: string) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return { error: "Unauthorized" };
  }

  try {
    const key = `events/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const result = await getStorageUploadUrl(key, contentType);
    return { url: result.uploadUrl, publicUrl: result.publicUrl };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getEvents() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return [];
  }

  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'desc' }
    });
    return events.map(e => ({
      ...e,
      date: e.date.toISOString(),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
