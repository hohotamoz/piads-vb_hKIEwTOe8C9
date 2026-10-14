import { NextResponse } from 'next/server'
import { verifyPiAccessToken, createSessionToken } from '@/lib/pi-auth'
import { createSession } from '@/lib/pi-session'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { accessToken, user: piUser } = body

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 })
    }

    // 1. Verify token with Pi Platform API (server-to-server)
    const verifiedUser = await verifyPiAccessToken(accessToken)
    
    if (!verifiedUser) {
      return NextResponse.json({ error: 'Invalid Pi token' }, { status: 401 })
    }

    // 2. Verify that the user from frontend matches the verified user
    if (piUser && piUser.uid && piUser.uid !== verifiedUser.uid) {
      return NextResponse.json({ error: 'User mismatch' }, { status: 401 })
    }

    const piUid = verifiedUser.uid
    const username = verifiedUser.username

    // 3. Create a secure session
    await createSession(piUid, username, accessToken)

    return NextResponse.json({
      success: true,
      user: {
        id: piUid,
        username: username,
        name: username,
      },
    })

  } catch (error: any) {
    console.error("Pi Login Error:", error)
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 })
  }
}
