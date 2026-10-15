import { NextResponse } from "next/server"

/**
 * Retired because accepting user_data from the client allowed forged roles.
 * The only session is created server-side after Pi token verification in
 * POST /api/auth/pi-login.
 */
export async function POST() {
  return NextResponse.json(
    { error: "This legacy endpoint is disabled. Authenticate through Pi Network." },
    { status: 410 },
  )
}
