import { type NextRequest, NextResponse } from "next/server"

const ADMIN_EMAIL = "hohotamoz200@gmail.com"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pi_auth_token, user_data } = body

    if (!pi_auth_token || !user_data) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    console.log("[v0] Setting session cookies for user:", user_data.username)

    // Determine if user is admin
    const isAdmin =
      user_data.username?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      user_data.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

    // Create response
    const response = NextResponse.json({ success: true })

    // Set authentication cookies
    response.cookies.set("auth_token", pi_auth_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    response.cookies.set("user_email", user_data.username || user_data.email || ADMIN_EMAIL, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    // Store user role
    response.cookies.set("user_role", isAdmin ? "admin" : "user", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    console.log("[v0] Session cookies set successfully")

    return response
  } catch (error) {
    console.error("[v0] Error setting session:", error)
    return NextResponse.json({ error: "Failed to set session" }, { status: 500 })
  }
}
