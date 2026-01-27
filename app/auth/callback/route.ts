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
                // Optimization: Try to fetch existing profile to get role
                // We rely on the DB trigger 'handle_new_user' to create the profile for new users
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()

                if (profile) {
                    role = profile.role
                } else {
                    // Profile might be created asynchronously by trigger. Default to 'user'.
                    // This avoids blocking the login flow for detailed profile creation check.
                    console.log("[Callback] Profile not found immediately (trigger latency?), defaulting role to 'user'")
                }
            } catch (err) {
                console.error("[Callback] Profile check error:", err)
            }

            // Create response with redirect
            const next = requestUrl.searchParams.get('next') || '/'
            const response = NextResponse.redirect(`${requestUrl.origin}${next}`)

            // Set Cookies for Middleware and Client Hydration
            // httpOnly must be false so AuthProvider can read it via document.cookie
            const cookieOptions = {
                path: "/",
                maxAge: 86400, // 1 day
                sameSite: "lax" as const,
                secure: requestUrl.protocol === "https:",
                httpOnly: false
            }

            response.cookies.set("auth_token", userId, cookieOptions)
            response.cookies.set("user_email", email, cookieOptions)
            response.cookies.set("user_role", role, cookieOptions)

            return response
        }
    }

    // URL to redirect to after sign up process completes
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=Invalid auth code`)
}
