import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/"

  // ✅ STEP 1: If no code, redirect to login
  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=no_code`)
  }

  try {
    // ✅ STEP 2: Create temporary server-side Supabase client to exchange code
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    })

    // ✅ STEP 3: Exchange OAuth code for session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !session) {
      console.error("[OAuth Callback] Session exchange error:", error?.message)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=session_exchange_failed`)
    }

    // ✅ STEP 4: Store session in a temporary non-httpOnly cookie for client-side handler
    // (Short-lived, 1 hour, for this specific OAuth flow)
    const response = NextResponse.redirect(`${requestUrl.origin}/auth/callback/processing?next=${encodeURIComponent(next)}`)

    const sessionData = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
    }

    response.cookies.set("supabase_session", JSON.stringify(sessionData), {
      path: "/",
      maxAge: 3600, // 1 hour
      sameSite: "lax",
      secure: requestUrl.protocol === "https:",
      httpOnly: false, // Client-side reading only (temporary)
    })

    return response
  } catch (error) {
    console.error("[OAuth Callback] Unexpected error:", error)
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_error`)
  }
}
