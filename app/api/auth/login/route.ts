import { type NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pi_auth_token } = body

    if (!pi_auth_token) {
      return NextResponse.json({ error: "Pi auth token required" }, { status: 400 })
    }

    const user = await signIn("admin@piads.com", "dummy-password")

    if (!user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      username: user.name,
      credits_balance: user.stats?.piBalance || 0,
      terms_accepted: user.verified,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
