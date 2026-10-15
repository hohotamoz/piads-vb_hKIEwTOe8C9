"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthLayout } from "@/components/auth-layout"
import { AlertCircle, Loader2 } from "lucide-react"
import { isPiSandboxMode } from "@/lib/system-config"

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound?: (payment: any) => void,
      ) => Promise<{
        accessToken: string
        user: {
          uid: string
          username: string
        }
      }>
    }
  }
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/"

  useEffect(() => {
    // Loading Pi SDK here ensures the same code path works in the Sandbox launcher.
    if (typeof window === "undefined" || window.Pi) return

    const script = document.createElement("script")
    script.src = "https://sdk.minepi.com/pi-sdk.js"
    script.async = true
    script.onerror = () => setError("Failed to load Pi SDK")
    document.head.appendChild(script)
    return () => {
      // Do not remove a shared SDK script; other app components may use it.
    }
  }, [])

  const handlePiLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      if (typeof window.Pi === "undefined") {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector<HTMLScriptElement>('script[src="https://sdk.minepi.com/pi-sdk.js"]')
          if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true })
            existing.addEventListener("error", () => reject(new Error("Failed to load Pi SDK")), { once: true })
            return
          }
          const script = document.createElement("script")
          script.src = "https://sdk.minepi.com/pi-sdk.js"
          script.onload = () => resolve()
          script.onerror = () => reject(new Error("Failed to load Pi SDK"))
          document.head.appendChild(script)
        })
      }

      if (!window.Pi) throw new Error("Pi SDK not available")

      window.Pi.init({ version: "2.0", sandbox: isPiSandboxMode() })

      const scopes = ["username", "payments"]
      const onIncompletePaymentFound = (payment: any) => {
        console.log("[Pi Login] Incomplete payment found:", payment)
      }

      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound)

      const response = await fetch("/api/auth/pi-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResult),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      router.push(redirectUrl)
      router.refresh()
    } catch (err: any) {
      console.error("Pi Login Error:", err)
      setError(err?.message || "Could not authenticate with Pi Network")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout variant="dark">
      <div className="w-full max-w-sm animate-slide-up mx-auto px-4">
        <h1 className="text-2xl font-bold text-white text-center mb-8 tracking-widest-custom uppercase">
          Welcome to PiAds
        </h1>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-500/30 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <Button
            onClick={handlePiLogin}
            disabled={isLoading}
            className="w-full h-14 bg-gradient-to-r from-[#FBC02D] to-[#F57F17] hover:from-[#FBC02D]/90 hover:to-[#F57F17]/90 text-black font-bold rounded-full shadow-lg transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <span className="text-lg mr-2 font-black">π</span>
                Login with Pi Network
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-white/50">
          Sign in with your Pi Network account to continue.
          <br />
          No email or password required.
        </p>
      </div>
    </AuthLayout>
  )
}
