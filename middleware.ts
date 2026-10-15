import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySessionToken } from "@/lib/pi-auth"

const protectedRoutes = [
  "/profile",
  "/messages",
  "/post",
  "/wallet",
  "/promote",
  "/settings",
  "/notifications",
  "/reviews",
  "/integrations",
  "/developers",
  "/my-ads",
  "/search",
  "/ad",
  "/category",
]

const adminOnlyRoutes = ["/admin"]

const authRoutes = ["/auth/login", "/auth/register"]

function getUserFromRequest(request: NextRequest): { isAuthenticated: boolean; isAdmin: boolean; piUid?: string } {
  const sessionCookie = request.cookies.get("piads_session")

  if (!sessionCookie) {
    return { isAuthenticated: false, isAdmin: false }
  }

  const { piUid, valid } = verifySessionToken(sessionCookie.value)

  if (!valid) {
    return { isAuthenticated: false, isAdmin: false }
  }

  // Check if user is admin (by Pi UID from env variable)
  const adminPiUid = process.env.PI_ADMIN_UID
  const isAdmin = adminPiUid ? piUid === adminPiUid : false

  return {
    isAuthenticated: true,
    isAdmin,
    piUid,
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes and static files
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/_next/") || pathname.includes(".")) {
    return NextResponse.next()
  }

  const { isAuthenticated, isAdmin } = getUserFromRequest(request)

  // Check admin routes
  const isAdminRoute = adminOnlyRoutes.some((route) => pathname.startsWith(route))
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      loginUrl.searchParams.set("error", "admin_required")
      return NextResponse.redirect(loginUrl)
    }

    if (!isAdmin) {
      const homeUrl = new URL("/", request.url)
      homeUrl.searchParams.set("error", "admin_only")
      return NextResponse.redirect(homeUrl)
    }
  }

  // Check protected routes
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*)",
  ],
}
