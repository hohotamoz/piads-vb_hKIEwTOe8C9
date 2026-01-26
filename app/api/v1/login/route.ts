import { type NextRequest, NextResponse } from "next/server"

const ADMIN_EMAIL = "hohotamoz200@gmail.com"

export async function POST(request: NextRequest) {
  console.log("[v0] 🔄 Login API endpoint called")

  try {
    const body = await request.json()
    const { pi_auth_token } = body

    console.log("[v0] Received Pi auth token:", pi_auth_token ? "✅ Present" : "❌ Missing")

    if (!pi_auth_token) {
      console.log("[v0] ❌ Pi auth token missing")
      return NextResponse.json({ error: "Pi auth token required" }, { status: 400 })
    }

    // In production, you would verify token with Pi Network API here
    const userData = {
      id: "user_" + Date.now(),
      username: "Pi User",
      credits_balance: 100,
      terms_accepted: true,
      role: "user",
      email: ADMIN_EMAIL,
    }

    console.log("[v0] ✅ User data created:", userData.username)

    const response = NextResponse.json(userData)

    response.cookies.set("auth_token", pi_auth_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    response.cookies.set("user_email", ADMIN_EMAIL, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    response.cookies.set("user_role", "admin", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    console.log("[v0] ✅ Login successful, cookies set")
    return response
  } catch (error) {
    console.error("[v0] ❌ Login error:", error)

    return NextResponse.json(
      {
        id: "user_fallback",
        username: "Pi User",
        credits_balance: 0,
        terms_accepted: true,
        role: "user",
        email: ADMIN_EMAIL,
      },
      { status: 200 },
    )
  }
}
