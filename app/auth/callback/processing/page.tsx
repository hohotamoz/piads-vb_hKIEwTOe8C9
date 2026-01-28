"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function OAuthCallbackProcessingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"

  useEffect(() => {
    const handleCallbackSession = async () => {
      try {
        console.log("[Callback Processing] Starting session processing...", { next })
        
        // ✅ STEP 1: Get session from cookie (set by /auth/callback/route.ts)
        const sessionCookie = document.cookie
          .split("; ")
          .find((c) => c.startsWith("supabase_session="))

        if (!sessionCookie) {
          console.error("[Callback Processing] No session cookie found")
          router.replace("/auth/login?error=missing_session")
          return
        }

        console.log("[Callback Processing] Found session cookie")

        // ✅ STEP 2: Parse session data
        const sessionJson = decodeURIComponent(sessionCookie.split("=")[1])
        const sessionData = JSON.parse(sessionJson)

        console.log("[Callback Processing] Parsed session data, setting in Supabase...")

        // ✅ STEP 3: Set session in Supabase Auth
        const { error } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        })

        // ✅ STEP 4: Clean up temporary cookie
        document.cookie = "supabase_session=; Max-Age=0; path=/"
        console.log("[Callback Processing] Cleaned up session cookie")

        // ✅ STEP 5: Redirect or error
        if (error) {
          console.error("[Callback Processing] Session set error:", error.message)
          router.replace(`/auth/login?error=${encodeURIComponent(error.message)}`)
        } else {
          console.log("[Callback Processing] Session set successfully, redirecting to:", next)
          // ✅ SUCCESS: Redirect to desired page
          // Let router handle redirect after auth context updates
          router.replace(next)
        }
      } catch (err) {
        console.error("[Callback Processing] Unexpected error:", err)
        router.replace("/auth/login?error=callback_error")
      }
    }

    handleCallbackSession()
  }, [router, next])

  // ✅ Show loading state while processing
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
        </div>
        <p className="text-white">Processing login...</p>
      </div>
    </div>
  )
}
