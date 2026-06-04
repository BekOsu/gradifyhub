import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "better-auth.session_token";

function getSessionCookie(request: NextRequest) {
  const direct =
    request.cookies.get(SESSION_COOKIE) ||
    request.cookies.get(`__Secure-${SESSION_COOKIE}`) ||
    request.cookies.get(`__Host-${SESSION_COOKIE}`);

  if (direct) return direct;

  return request.cookies
    .getAll()
    .find((cookie) => cookie.name.includes("better-auth.session_token"));
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams, hostname, protocol } = request.nextUrl;
  const session = getSessionCookie(request);
  const onboarded = request.cookies.get("onboarded");

  const canonicalAppUrl = process.env.BETTER_AUTH_URL;
  const isVercelPreview = process.env.VERCEL_ENV === "preview";

  // Keep production host/protocol canonicalization, but do not force preview deployments
  // to redirect to the production domain.
  if (canonicalAppUrl && process.env.NODE_ENV === "production" && !isVercelPreview) {
    const canonical = new URL(canonicalAppUrl);
    if (canonical.hostname !== hostname) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.protocol = canonical.protocol;
      redirectUrl.host = canonical.host;
      return NextResponse.redirect(redirectUrl);
    }
    if (protocol !== canonical.protocol) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.protocol = canonical.protocol;
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (!session) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("from", pathname);
    return NextResponse.redirect(signIn);
  }

  const isOnboardingPath = pathname.startsWith("/onboarding");
  const isOnboardingEditMode = isOnboardingPath && searchParams.get("edit") === "1";
  const isAppPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/assessment") ||
    pathname.startsWith("/roadmap") ||
    pathname.startsWith("/roadmaps") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/resume") ||
    pathname.startsWith("/interview-prep") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/usage");

  if (session && onboarded && isOnboardingPath && !isOnboardingEditMode) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session && !onboarded && isAppPath && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/onboarding/step-1", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assessment/:path*",
    "/roadmap/:path*",
    "/roadmaps/:path*",
    "/roadmaps",
    "/learn/:path*",
    "/resume/:path*",
    "/interview-prep/:path*",
    "/onboarding/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/community/:path*",
    "/profile/:path*",
    "/usage/:path*",
  ],
};
