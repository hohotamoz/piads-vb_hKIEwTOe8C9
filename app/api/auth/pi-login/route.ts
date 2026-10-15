import { NextResponse } from "next/server"
import { verifyPiAccessToken } from "@/lib/pi-auth"
import { createSession } from "@/lib/pi-session"
import { ensurePiProfile } from "@/lib/pi-user"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const accessToken = typeof body?.accessToken === "string" ? body.accessToken : ""
    const clientUid = typeof body?.user?.uid === "string" ? body.user.uid : ""

    if (!accessToken) {
      return NextResponse.json({ error: "Pi access token is required." }, { status: 400 })
    }

    // Never trust the client-provided username/UID; Pi's API is authoritative.
    const verifiedUser = await verifyPiAccessToken(accessToken)
    if (!verifiedUser?.uid || !verifiedUser.username) {
      return NextResponse.json({ error: "Pi could not verify this account. Please try signing in again." }, { status: 401 })
    }
    if (clientUid && clientUid !== verifiedUser.uid) {
      return NextResponse.json({ error: "The Pi account did not match the verified identity." }, { status: 401 })
    }

    // Create the app's persistent profile on first Pi sign-in, then reuse it.
    const profile = await ensurePiProfile(verifiedUser.uid, verifiedUser.username)

    // This is an app session cookie, not a second login system. Pi remains the
    // sole user-facing identity provider; the access token is never stored in a cookie.
    await createSession(verifiedUser.uid, verifiedUser.username)

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: profile.id,
        piUid: verifiedUser.uid,
        username: profile.username,
        name: profile.name || profile.username,
        email: profile.email,
        role: profile.role || "user",
        avatar: profile.avatar || null,
        verified: profile.verified ?? true,
        stats: profile.stats || {},
        createdAt: profile.created_at || new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[Pi Login] Failed:", error)
    const message = error instanceof Error ? error.message : "Pi login failed."
    const status = message.includes("SUPABASE") || message.includes("Supabase") ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
