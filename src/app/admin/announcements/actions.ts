"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function createAnnouncement(formData: FormData) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title || !description) {
    return { error: "Title and description are required" };
  }

  try {
    await prisma.announcement.create({
      data: {
        title,
        description,
        category,
        isFeatured,
        isPublished: true
      }
    });

    revalidatePath("/announcements");
    revalidatePath("/");
    revalidatePath("/admin/announcements");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteAnnouncement(id: string) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.announcement.delete({
      where: { id }
    });

    revalidatePath("/announcements");
    revalidatePath("/");
    revalidatePath("/admin/announcements");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getAnnouncements() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return [];
  }

  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return announcements.map(a => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
