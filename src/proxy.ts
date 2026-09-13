import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const adminSession = request.cookies.get("admin_session")?.value;
  const isAuthenticated = adminSession === "authenticated";

  const isApiAdminRoute = request.nextUrl.pathname.startsWith('/api/admin');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login');

  if (!isAuthenticated && (isAdminRoute || isApiAdminRoute)) {
    // No valid session, redirect to login page
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (isAuthenticated && request.nextUrl.pathname.startsWith('/admin/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
