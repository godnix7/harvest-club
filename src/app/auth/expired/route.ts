import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

/** Clears a session that is no longer valid (e.g. the admin account was disabled) and returns to login. */
export async function GET(request: Request) {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
}
