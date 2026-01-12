import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();

  // Clear auth cookie
  cookieStore.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  // Clear remember-email cookie
  cookieStore.set("remember-email", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  // Redirect to login page with a "logged out" indicator
  const url = new URL("/login?loggedOut=1", request.url);
  return NextResponse.redirect(url);
}
