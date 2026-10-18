import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/session";
import { AdminHeader } from "../_components/AdminPage";
import { AdminForm, Field } from "../_components/controls";
import { changeOwnPassword } from "./actions";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="max-w-xl">
      <AdminHeader title="My account" description="Your sign-in details and password." />

      <div className="admin-card mb-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div><dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Name</dt><dd className="mt-1 font-medium">{admin.name}</dd></div>
          <div><dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Email</dt><dd className="mt-1 break-all font-medium">{admin.email}</dd></div>
          <div><dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Role</dt><dd className="mt-1 font-medium">{admin.role === "super" ? "Super Admin" : "Admin"}</dd></div>
        </dl>
      </div>

      <div className="admin-card">
        <h2 className="mb-4 font-semibold">Change password</h2>
        <AdminForm action={changeOwnPassword} submitLabel="Update password">
          <Field label="Current password"><input type="password" name="current" required autoComplete="current-password" className="field" /></Field>
          <Field label="New password" hint="At least 8 characters."><input type="password" name="next" required minLength={8} autoComplete="new-password" className="field" /></Field>
          <Field label="Confirm new password"><input type="password" name="confirm" required minLength={8} autoComplete="new-password" className="field" /></Field>
        </AdminForm>
      </div>
    </div>
  );
}
