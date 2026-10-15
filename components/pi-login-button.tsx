"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { isPiSandboxMode } from "@/lib/system-config"

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void | Promise<void>
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound?: (payment: any) => void,
      ) => Promise<{ accessToken: string; user: { uid: string; username: string } }>
    }
  }
}

export function PiLoginButton() {
  const [loading, setLoading] = useState(false)
  const [isPiBrowser, setIsPiBrowser] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkPi = () => {
      if (navigator.userAgent.includes("PiBrowser") || typeof window.Pi !== "undefined") setIsPiBrowser(true)
    }
    checkPi()
  }, [])

  const handlePiLogin = async () => {
    setLoading(true)
    try {
      if (!window.Pi) throw new Error("Pi SDK not loaded. Open PiAds inside Pi Browser and try again.")
      await window.Pi.init({ version: "2.0", sandbox: isPiSandboxMode() })
      const authResult = await window.Pi.authenticate(["username", "payments"], (payment: any) => {
        console.info("Pi reported an incomplete payment:", payment?.identifier)
      })

      const response = await fetch("/api/auth/pi-login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResult),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Pi login failed")

      window.dispatchEvent(new Event("piads-auth-changed"))
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("[Pi Login] Failed:", error)
      alert(error instanceof Error ? error.message : "Could not authenticate with Pi Network")
    } finally {
      setLoading(false)
    }
  }

  if (!isPiBrowser) return null

  return (
    <Button onClick={handlePiLogin} disabled={loading} className="w-full h-14 bg-gradient-to-r from-[#FBC02D] to-[#F57F17] hover:from-[#FBC02D]/90 hover:to-[#F57F17]/90 text-black font-bold rounded-full shadow-lg transition-all">
      {loading ? (
        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Authenticating...</>
      ) : (
        <><span className="text-lg mr-2 font-black">π</span>Login with Pi Network</>
      )}
    </Button>
  )
}
