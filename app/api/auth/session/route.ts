import { NextResponse } from "next/server"
import { getSessionWithStatus } from "@/lib/pi-session"

export const runtime = "nodejs"

export async function GET() {
  try {
    const { session, reason } = await getSessionWithStatus()
    if (!session) {
      // Safe diagnostic only: never expose cookies, tokens, UIDs or database errors.
      return NextResponse.json(
        { authenticated: false, user: null, reason },
        { status: reason === "profile_lookup_error" ? 503 : 200, headers: { "Cache-Control": "no-store" } },
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        piUid: session.piUid,
        username: session.username,
        name: session.name,
        role: session.role,
        avatar: session.avatar,
        verified: session.verified,
        stats: session.stats,
        createdAt: session.createdAt,
      },
    })
  } catch (error) {
    console.error("[Pi Session] Check failed:", error)
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 })
  }
}
