"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { generateUploadUrl as getStorageUploadUrl } from "@/lib/storage";

export async function createSponsor(formData: FormData) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const tier = formData.get("tier") as string;
  const description = formData.get("description") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const websiteUrl = formData.get("websiteUrl") as string;

  if (!name) {
    return { error: "Name is required" };
  }

  try {
    await prisma.sponsor.create({
      data: {
        name,
        tier,
        description,
        logoUrl,
        websiteUrl,
        isActive: true,
        orderIndex: 0
      }
    });

    revalidatePath("/sponsors");
    revalidatePath("/admin/sponsors");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getPresignedUrl(filename: string, contentType: string) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return { error: "Unauthorized" };
  }

  try {
    const key = `sponsors/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const result = await getStorageUploadUrl(key, contentType);
    return { url: result.uploadUrl, publicUrl: result.publicUrl };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteSponsor(id: string) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.sponsor.delete({
      where: { id }
    });

    revalidatePath("/sponsors");
    revalidatePath("/admin/sponsors");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getSponsors() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAuthenticated) {
    return [];
  }

  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return sponsors.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
