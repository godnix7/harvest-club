import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession, type Session } from "@/lib/auth";

export type CurrentAdmin = Session & { name: string; uid: string; canEditSettings: boolean };

/**
 * The signed-in admin, fully validated against the database on every request:
 * the account must still exist and be active, and the role comes from the database
 * (not the cookie), so disabling or demoting someone takes effect immediately.
 */
export const currentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const session = await getSession();
  if (!session?.uid) return null; // sessions from before the database migration must sign in again
  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: session.uid },
      select: { id: true, isActive: true, name: true, email: true, role: true, canEditSettings: true },
    });
    if (!user?.isActive) return null;
    return {
      ...session,
      uid: user.id,
      email: user.email,
      name: user.name,
      role: user.role === "SUPER" ? "super" : "admin",
      // Super Admins can always edit settings; normal admins only when granted.
      canEditSettings: user.role === "SUPER" || user.canEditSettings,
    };
  } catch {
    return null;
  }
});
