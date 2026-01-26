"use client"

import { useEffect, useState } from "react"
import { usePiAuth } from "@/contexts/pi-auth-context"

export function AuthSuccessHandler() {
  const { isAuthenticated, userData, piAccessToken } = usePiAuth()
  const [hasHandledAuth, setHasHandledAuth] = useState(false)

  useEffect(() => {
    if (isAuthenticated && userData && piAccessToken && !hasHandledAuth) {
      console.log("[v0] ✅ Setting up authenticated session...")
      setHasHandledAuth(true)

      // Set server-side cookies for session persistence
      fetch("/api/v1/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pi_auth_token: piAccessToken,
          user_data: userData,
        }),
      })
        .then((response) => {
          if (response.ok) {
            console.log("[v0] ✅ Session set successfully")
          } else {
            console.log("[v0] ⚠️ Session API returned status:", response.status)
          }
        })
        .catch((error) => {
          console.error("[v0] ⚠️ Error setting session:", error)
        })
    }
  }, [isAuthenticated, userData, piAccessToken, hasHandledAuth])

  return null
}
