import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/server";

// Next.js 16 "proxy" (formerly middleware). Must live at src/proxy.ts to be loaded.
// This is a UX redirect layer only: every protected page and server action
// still verifies the token itself via supabase.auth.getUser().

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/services", "/calendar", "/user"];

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  const { pathname } = req.nextUrl;

  // Not logged in → block protected pages
  if (!token && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in → skip the login page, but only if the token is actually valid.
  // A stale cookie would otherwise loop /login → /dashboard → /login.
  if (token && pathname === "/login") {
    const { data, error } = await supabase.auth.getUser(token);

    if (!error && data?.user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const res = NextResponse.next();
    res.cookies.delete("auth-token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/services/:path*",
    "/calendar/:path*",
    "/user/:path*",
    "/login",
  ],
};
