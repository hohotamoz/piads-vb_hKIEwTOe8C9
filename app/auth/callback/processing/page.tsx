"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function OAuthCallbackProcessingPage() {
  const router = useRouter()

  useEffect(() => {
    (async () => {
      try {
        const cookie = document.cookie.split("; ").find(c => c.startsWith("supabase_session="))
        if (!cookie) {
          router.replace("/auth/login?error=missing_session")
          return
        }
        const value = decodeURIComponent(cookie.split("=")[1])
        const s = JSON.parse(value)
        const { error } = await supabase.auth.setSession({
          access_token: s.access_token,
          refresh_token: s.refresh_token
        })
        document.cookie = "supabase_session=; Max-Age=0; path=/"
        const params = new URLSearchParams(window.location.search)
        const next = params.get("next") || "/"
        if (error) {
          router.replace(`/auth/login?error=${encodeURIComponent(error.message || 'set_session_error')}`)
        } else {
          window.location.href = next
        }
      } catch (err) {
        console.error("OAuth callback handler error:", err)
        router.replace("/auth/login?error=callback_failed")
      }
    })()
  }, [router])

  return <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
      </div>
      <p className="text-white">Processing login...</p>
    </div>
  </div>
}
