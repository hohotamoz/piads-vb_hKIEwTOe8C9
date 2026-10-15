import { NextResponse } from "next/server"

/** Legacy cookies are not proof of identity. Use /api/auth/session after Pi login. */
export async function GET() {
  return NextResponse.json(
    { authenticated: false, error: "Legacy sessions are disabled. Sign in with Pi Network." },
    { status: 410 },
  )
}
