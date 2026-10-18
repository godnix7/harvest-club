import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { prisma, safe } from "@/lib/site";
import AdminNav from "./_components/AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Harvest Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) return <>{children}</>;

  const unread = await safe(() => prisma.contactMessage.count({ where: { status: "UNREAD" } }), 0);

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f5f1] md:flex-row">
      <AdminNav email={process.env.ADMIN_EMAIL || "Administrator"} unread={unread} />
      <div className="min-w-0 flex-1 p-4 sm:p-8">{children}</div>
    </div>
  );
}
