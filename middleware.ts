import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_EMAIL = "hohotamoz200@gmail.com"

const protectedRoutes = [
  "/",
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

function getUserFromRequest(request: NextRequest): { isAuthenticated: boolean; isAdmin: boolean; email?: string } {
  const authCookie = request.cookies.get("auth_token")

  if (!authCookie) {
    // Check if user data exists in localStorage (client-side check will handle this)
    return { isAuthenticated: false, isAdmin: false }
  }

  const userEmailCookie = request.cookies.get("user_email")
  const userRoleCookie = request.cookies.get("user_role")
  const email = userEmailCookie?.value

  const isAdmin =
    userRoleCookie?.value === "admin" || (email ? email.toLowerCase() === ADMIN_EMAIL.toLowerCase() : false)

  return {
    isAuthenticated: true,
    isAdmin,
    email,
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/_next/") || pathname.startsWith("/placeholder.svg") || pathname.includes(".")) {
    return NextResponse.next()
  }

  const { isAuthenticated, isAdmin } = getUserFromRequest(request)

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

  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route === "/") return pathname === "/"
    return pathname.startsWith(route)
  })

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (✅ ALLOW OAuth Callback routes)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*)",
  ],
}
