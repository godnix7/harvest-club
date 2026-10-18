import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/site";
import { AdminHeader, Empty, StatusBadge } from "../_components/AdminPage";
import { AdminForm, ActionButton, Field } from "../_components/controls";
import { createAdmin, setAdminActive, resetAdminPassword, deleteAdmin } from "./actions";
import { PasswordField, ResetPasswordButton } from "./UserControls";

export const metadata: Metadata = { title: "Admin users" };

export default async function AdminUsersPage() {
  const admin = await currentAdmin();
  if (admin?.role !== "super") redirect("/admin");

  let users: Awaited<ReturnType<typeof prisma.adminUser.findMany>> = [];
  let loadError: string | null = null;
  try {
    users = await prisma.adminUser.findMany({ orderBy: { createdAt: "desc" } });
  } catch (error) {
    console.error(error);
    loadError =
      "Could not load admin users. If this is the first time using this page, run “npx prisma db push” so the AdminUser table exists, and check the database connection.";
  }

  return (
    <div>
      <AdminHeader
        title="Admin users"
        description="Give team members and faculty access to manage website content. Only you, the Super Admin, can see this page."
      />

      <div className="grid gap-8 xl:grid-cols-3">
        <section className="admin-card h-fit">
          <h2 className="mb-4 font-semibold">Add admin</h2>
          <AdminForm action={createAdmin} submitLabel="Create admin">
            <Field label="Full name *"><input name="name" required maxLength={100} autoComplete="off" className="field" /></Field>
            <Field label="Email *"><input type="email" name="email" required autoComplete="off" className="field" /></Field>
            <PasswordField />
          </AdminForm>
          <div className="mt-5 rounded-xl bg-[var(--color-paper)] p-3 text-xs leading-relaxed text-[var(--color-muted)]">
            <p className="font-semibold text-[var(--color-ink)]">What can a normal admin do?</p>
            <p className="mt-1">Manage events, team, gallery, sponsors, announcements, messages and site settings. They cannot add, disable or delete other admins.</p>
          </div>
        </section>

        <section className="admin-card !p-0 overflow-hidden xl:col-span-2">
          {loadError && <p className="m-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{loadError}</p>}
          <div className="overflow-x-auto">
            <table className="stack-table min-w-full divide-y divide-[var(--color-line)]">
              <thead className="bg-[var(--color-paper)]">
                <tr><th className="admin-th">Admin</th><th className="admin-th">Last sign-in</th><th className="admin-th">Status</th><th className="admin-th text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)] max-md:divide-y-0">
                <tr>
                  <td className="admin-td"><p className="font-medium">Super Admin</p><p className="text-xs text-[var(--color-muted)]">{admin.email}</p></td>
                  <td className="admin-td text-[var(--color-muted)]">—</td>
                  <td className="admin-td"><StatusBadge tone="blue">You</StatusBadge></td>
                  <td className="admin-td text-xs text-[var(--color-muted)] md:text-right">Managed in server settings</td>
                </tr>
                {users.length === 0 && !loadError && <tr><td colSpan={4}><Empty>No other admins yet. Add one with the form.</Empty></td></tr>}
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="admin-td"><p className="font-medium">{u.name}</p><p className="text-xs text-[var(--color-muted)]">{u.email}</p></td>
                    <td className="admin-td whitespace-nowrap">{u.lastLoginAt ? formatDate(u.lastLoginAt, true) : "Never"}</td>
                    <td className="admin-td"><StatusBadge tone={u.isActive ? "green" : "gray"}>{u.isActive ? "Active" : "Disabled"}</StatusBadge></td>
                    <td className="admin-td">
                      <div className="flex flex-wrap items-start gap-x-5 gap-y-1 md:justify-end">
                        <ResetPasswordButton action={resetAdminPassword.bind(null, u.id)} name={u.name} />
                        <ActionButton
                          action={setAdminActive.bind(null, u.id, !u.isActive)}
                          label={u.isActive ? "Disable" : "Enable"}
                          confirmText={u.isActive ? `Disable ${u.name}? They will be signed out immediately.` : undefined}
                        />
                        <ActionButton action={deleteAdmin.bind(null, u.id)} label="Delete" variant="danger" confirmText={`Permanently delete ${u.name}'s admin account?`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
