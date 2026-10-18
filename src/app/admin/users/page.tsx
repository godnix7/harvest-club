import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/site";
import { AdminHeader, Empty, StatusBadge } from "../_components/AdminPage";
import { AdminForm, ActionButton, Field } from "../_components/controls";
import { createAdmin, setAdminActive, setAdminRole, setSettingsAccess, resetAdminPassword, deleteAdmin } from "./actions";
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
        description="Give team members and faculty access to manage website content. Only Super Admins can see this page."
      />

      <div className="grid gap-8 xl:grid-cols-3">
        <section className="admin-card h-fit">
          <h2 className="mb-4 font-semibold">Add admin</h2>
          <AdminForm action={createAdmin} submitLabel="Create admin">
            <Field label="Full name *"><input name="name" required maxLength={100} autoComplete="off" className="field" /></Field>
            <Field label="Email *"><input type="email" name="email" required autoComplete="off" className="field" /></Field>
            <Field label="Role">
              <select name="role" defaultValue="ADMIN" className="field">
                <option value="ADMIN">Admin — manages website content</option>
                <option value="SUPER">Super Admin — also manages admins</option>
              </select>
            </Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[var(--color-paper)] p-3">
              <input type="checkbox" name="canEditSettings" className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-harvest-green)]" />
              <span>
                <span className="block text-sm font-semibold">Allow editing Site settings</span>
                <span className="block text-xs text-[var(--color-muted)]">Branding, contact details, banner, maintenance mode and more. Super Admins always have this.</span>
              </span>
            </label>
            <PasswordField />
          </AdminForm>
          <div className="mt-5 rounded-xl bg-[var(--color-paper)] p-3 text-xs leading-relaxed text-[var(--color-muted)]">
            <p className="font-semibold text-[var(--color-ink)]">What can a normal admin do?</p>
            <p className="mt-1">Manage events, team, gallery, sponsors, announcements, messages and site settings. Only Super Admins can add, disable, promote or delete other admins.</p>
          </div>
        </section>

        <section className="admin-card !p-0 overflow-hidden xl:col-span-2">
          {loadError && <p className="m-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{loadError}</p>}
          <div className="overflow-x-auto">
            <table className="stack-table min-w-full divide-y divide-[var(--color-line)]">
              <thead className="bg-[var(--color-paper)]">
                <tr><th className="admin-th">Admin</th><th className="admin-th">Site settings</th><th className="admin-th">Last sign-in</th><th className="admin-th">Status</th><th className="admin-th text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)] max-md:divide-y-0">
                {users.length === 0 && !loadError && <tr><td colSpan={5}><Empty>No admins yet.</Empty></td></tr>}
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="admin-td"><p className="font-medium">{u.name}{u.id === admin.uid && <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">(you)</span>}</p><p className="text-xs text-[var(--color-muted)]">{u.email}</p><span className="mt-1 inline-block"><StatusBadge tone={u.role === "SUPER" ? "blue" : "gray"}>{u.role === "SUPER" ? "Super Admin" : "Admin"}</StatusBadge></span></td>
                    <td className="admin-td">
                      {u.role === "SUPER" ? (
                        <StatusBadge tone="blue">Always</StatusBadge>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge tone={u.canEditSettings ? "green" : "gray"}>{u.canEditSettings ? "✓ Allowed" : "Not allowed"}</StatusBadge>
                          <ActionButton action={setSettingsAccess.bind(null, u.id, !u.canEditSettings)} label={u.canEditSettings ? "Revoke access" : "Allow access"} />
                        </div>
                      )}
                    </td>
                    <td className="admin-td whitespace-nowrap">{u.lastLoginAt ? formatDate(u.lastLoginAt, true) : "Never"}</td>
                    <td className="admin-td"><StatusBadge tone={u.isActive ? "green" : "gray"}>{u.isActive ? "Active" : "Disabled"}</StatusBadge></td>
                    <td className="admin-td">
                      <div className="flex flex-wrap items-start gap-x-5 gap-y-1 md:justify-end">
                        <ResetPasswordButton action={resetAdminPassword.bind(null, u.id)} name={u.name} />
                        {u.id !== admin.uid && (
                          <ActionButton
                            action={setAdminRole.bind(null, u.id, u.role === "SUPER" ? "ADMIN" : "SUPER")}
                            label={u.role === "SUPER" ? "Make admin" : "Make super admin"}
                            confirmText={u.role === "SUPER" ? `Remove Super Admin rights from ${u.name}?` : `Give ${u.name} full Super Admin rights, including managing other admins?`}
                          />
                        )}
                        {u.id !== admin.uid && (
                          <>
                            <ActionButton
                              action={setAdminActive.bind(null, u.id, !u.isActive)}
                              label={u.isActive ? "Disable" : "Enable"}
                              confirmText={u.isActive ? `Disable ${u.name}? They will be signed out immediately.` : undefined}
                            />
                            <ActionButton action={deleteAdmin.bind(null, u.id)} label="Delete" variant="danger" confirmText={`Permanently delete ${u.name}'s admin account?`} />
                          </>
                        )}
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
