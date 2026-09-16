import { NextRequest, NextResponse } from "next/server";
import { sessionCookie, verifySession } from "@/lib/session";

const publicPaths = [
  "/login",
  "/setup",
  "/api/auth/login",
  "/api/setup",
  "/_next",
  "/favicon.ico",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublic = publicPaths.some(
    (publicPath) =>
      path === publicPath || path.startsWith(`${publicPath}/`),
  );

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get(sessionCookie)?.value;

  if (!token) {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Oturum gerekli" },
        { status: 401 },
      );
    }

    return NextResponse.redirect(
      new URL(
        `/login?returnTo=${encodeURIComponent(path)}`,
        request.url,
      ),
    );
  }

  try {
    await verifySession(token);
    return NextResponse.next();
  } catch {
    const response = path.startsWith("/api/")
      ? NextResponse.json(
          { error: "Oturum geçersiz" },
          { status: 401 },
        )
      : NextResponse.redirect(
          new URL(
            `/login?returnTo=${encodeURIComponent(path)}`,
            request.url,
          ),
        );

    response.cookies.delete(sessionCookie);

    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};