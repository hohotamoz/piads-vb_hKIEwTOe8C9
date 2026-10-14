import { NextResponse } from "next/server"
import { getSession } from "@/lib/pi-session"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.piUid,
        username: session.username,
        name: session.username,
      },
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ authenticated: false })
  }
}
