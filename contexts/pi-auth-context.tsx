"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface PiAuthContextType {
  isAuthenticated: boolean
  authMessage: string
  piAccessToken: string | null
  userData: any | null
  reinitialize: () => Promise<void>
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined)

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Ready")
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated) {
            setIsAuthenticated(true)
            setUserData(data.user)
            setAuthMessage("Authenticated")
          }
        }
      } catch (error) {
        console.error("Session check error:", error)
      }
    }

    checkSession()
  }, [])

  const reinitialize = async () => {
    setAuthMessage("Initializing...")
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
          setUserData(data.user)
          setAuthMessage("Authenticated")
        }
      }
    } catch (error) {
      console.error("Reinitialization error:", error)
      setAuthMessage("Not authenticated")
    }
  }

  const value: PiAuthContextType = {
    isAuthenticated,
    authMessage,
    piAccessToken,
    userData,
    reinitialize,
  }

  return <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
}

export function usePiAuth() {
  const context = useContext(PiAuthContext)
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider")
  }
  return context
}
