import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")
  const userEmail = request.cookies.get("user_email")
  const userRole = request.cookies.get("user_role")

  if (!authToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    email: userEmail?.value,
    role: userRole?.value || "user",
  })
}
