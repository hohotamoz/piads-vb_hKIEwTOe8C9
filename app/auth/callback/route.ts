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
                    // Pass the cookie for proper session handling
                    cookie: request.headers.get("cookie") || "",
                },
            },
        })

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Redirect to dashboard or home after successful login
            return NextResponse.redirect(`${requestUrl.origin}/`)
        }
    }

    // URL to redirect to after sign up process completes
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=Invalid auth code`)
}
