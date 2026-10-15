import { NextResponse } from "next/server"

/** Use /api/auth/pi-login, which verifies the access token with Pi's API. */
export async function POST() {
  return NextResponse.json(
    { error: "This legacy endpoint is disabled. Sign in with Pi Network.", useEndpoint: "/api/auth/pi-login" },
    { status: 410 },
  )
}
