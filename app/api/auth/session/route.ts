import { NextResponse } from "next/server"
import { getSession } from "@/lib/pi-session"

export const runtime = "nodejs"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        piUid: session.piUid,
        username: session.username,
        name: session.name,
        email: session.email,
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
