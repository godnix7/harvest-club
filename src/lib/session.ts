import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession, type Session } from "@/lib/auth";

export type CurrentAdmin = Session & { name: string };

/**
 * The signed-in admin, fully validated: Super Admins come from the environment;
 * normal admins must still exist and be active in the database (so disabling an
 * account takes effect immediately, not when its session expires).
 */
export const currentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "super") return { ...session, name: "Super Admin" };
  if (!session.uid) return null;
  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: session.uid },
      select: { isActive: true, name: true, email: true },
    });
    return user?.isActive ? { ...session, email: user.email, name: user.name } : null;
  } catch {
    return null;
  }
});
