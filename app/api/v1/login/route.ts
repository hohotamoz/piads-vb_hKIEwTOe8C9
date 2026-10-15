import { NextResponse } from "next/server"

/**
 * Retired legacy endpoint. It previously trusted arbitrary client tokens and
 * could issue admin cookies without verifying identity with Pi Network.
 * Use POST /api/auth/pi-login, which validates the token with Pi's API.
 */
export async function POST() {
  return NextResponse.json(
    { error: "This legacy endpoint is disabled. Sign in with Pi Network.", useEndpoint: "/api/auth/pi-login" },
    { status: 410 },
  )
}
