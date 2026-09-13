import Link from "next/link";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin_session")?.value === "authenticated";
  const adminEmail = process.env.ADMIN_EMAIL || "Admin";

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-[var(--color-harvest-blue-dark)] text-white shadow-xl md:min-h-screen flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <Link href="/" className="font-bold text-xl tracking-tight block">
            Harvest <span className="text-[var(--color-harvest-green)]">Admin</span>
          </Link>
          {isAuthenticated && (
            <p className="text-sm text-blue-200 mt-2 truncate">
              {adminEmail}
            </p>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="block px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/events" className="block px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
            Events
          </Link>
          <Link href="/admin/sponsors" className="block px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
            Sponsors
          </Link>
          <Link href="/admin/announcements" className="block px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
            Announcements
          </Link>
          <Link href="/admin/settings" className="block px-4 py-2 rounded-md hover:bg-blue-800 transition-colors">
            Site Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full text-left px-4 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition-colors flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>

    </div>
  );
}
