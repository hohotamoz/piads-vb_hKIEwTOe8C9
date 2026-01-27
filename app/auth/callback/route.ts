import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
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

        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && session?.user) {
            const userId = session.user.id
            const email = session.user.email!

            // Checks/Create Profile Logic (Server-Side)
            let role = 'user' // Default

            try {
                // 1. Try to fetch existing profile
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()

                if (profile) {
                    role = profile.role
                } else {
                    // 2. Create if missing (Social Login first time)
                    console.log("[Callback] Creating profile for new social user...")
                    const name = session.user.user_metadata.full_name || session.user.user_metadata.name || email.split('@')[0]
                    const avatar = session.user.user_metadata.avatar_url || session.user.user_metadata.picture

                    const { error: insertError } = await supabase.from('profiles').insert({
                        id: userId,
                        email: email,
                        name: name,
                        avatar: avatar,
                        role: 'user',
                        verified: true,
                        created_at: new Date().toISOString()
                    })

                    if (insertError) {
                        console.error("[Callback] Profile creation failed:", insertError)
                        // Should we abort? Maybe not, allow login but profile might be partial
                    }
                }
            } catch (err) {
                console.error("[Callback] Profile check error:", err)
            }

            // Create response with redirect
            const response = NextResponse.redirect(`${requestUrl.origin}/`)

            // Set Cookies for Middleware
            response.cookies.set("auth_token", userId, {
                path: "/",
                maxAge: 86400, // 1 day
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production"
            })
            response.cookies.set("user_email", email, {
                path: "/",
                maxAge: 86400,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production"
            })
            response.cookies.set("user_role", role, {
                path: "/",
                maxAge: 86400,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production"
            })

            return response
        }
    }

    // URL to redirect to after sign up process completes
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=Invalid auth code`)
}
