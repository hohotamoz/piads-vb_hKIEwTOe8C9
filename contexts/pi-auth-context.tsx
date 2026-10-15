"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface PiAuthContextType {
  isAuthenticated: boolean
  authMessage: string
  /** Pi access tokens are intentionally not persisted in client state after login. */
  piAccessToken: string | null
  userData: any | null
  reinitialize: () => Promise<void>
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined)

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Checking Pi session...")
  const [userData, setUserData] = useState<any>(null)

  const reinitialize = useCallback(async () => {
    setAuthMessage("Checking Pi session...")
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "same-origin",
        cache: "no-store",
      })
      const data = await response.json()
      const authenticated = response.ok && data.authenticated === true && !!data.user
      setIsAuthenticated(authenticated)
      setUserData(authenticated ? data.user : null)
      setAuthMessage(authenticated ? "Authenticated with Pi Network" : "Not authenticated")
    } catch (error) {
      console.error("[PiAuth] Session check failed:", error)
      setIsAuthenticated(false)
      setUserData(null)
      setAuthMessage("Not authenticated")
    }
  }, [])

  useEffect(() => {
    void reinitialize()
    const onAuthChanged = () => { void reinitialize() }
    window.addEventListener("piads-auth-changed", onAuthChanged)
    return () => window.removeEventListener("piads-auth-changed", onAuthChanged)
  }, [reinitialize])

  return (
    <PiAuthContext.Provider value={{
      isAuthenticated,
      authMessage,
      piAccessToken: null,
      userData,
      reinitialize,
    }}>
      {children}
    </PiAuthContext.Provider>
  )
}

export function usePiAuth() {
  const context = useContext(PiAuthContext)
  if (context === undefined) throw new Error("usePiAuth must be used within a PiAuthProvider")
  return context
}
