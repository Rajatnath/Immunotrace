import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnHome = req.nextUrl.pathname === "/";

  if (!isLoggedIn && !isOnHome) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isLoggedIn && isOnHome) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};