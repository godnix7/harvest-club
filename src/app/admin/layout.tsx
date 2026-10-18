import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { currentAdmin } from "@/lib/session";
import { prisma, safe } from "@/lib/site";
import AdminNav from "./_components/AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Harvest Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) {
    // A valid cookie for an account that was disabled/removed: clear it and go to login.
    if (await getSession()) redirect("/auth/expired");
    return <>{children}</>;
  }

  const unread = await safe(() => prisma.contactMessage.count({ where: { status: "UNREAD" } }), 0);

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f5f1] md:flex-row">
      <AdminNav name={admin.name} email={admin.email} role={admin.role} unread={unread} />
      <div className="min-w-0 flex-1 p-4 sm:p-8">{children}</div>
    </div>
  );
}
