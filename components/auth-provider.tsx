"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"

export interface User {
  id: string
  piUid?: string
  username: string
  name: string
  email?: string
  role: string
  avatar?: string | null
  verified?: boolean
  stats?: Record<string, any>
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  refreshSession: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      })
      const data = await response.json()
      setUser(response.ok && data.authenticated && data.user ? data.user as User : null)
    } catch (error) {
      console.error("[AuthProvider] Session check failed:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshSession()
    const onAuthChanged = () => { void refreshSession() }
    window.addEventListener("piads-auth-changed", onAuthChanged)
    return () => window.removeEventListener("piads-auth-changed", onAuthChanged)
  }, [refreshSession])

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })
      if (!response.ok) throw new Error("Logout request failed")
      setUser(null)
      window.dispatchEvent(new Event("piads-auth-changed"))
      window.location.href = "/"
    } catch (error) {
      console.error("[AuthProvider] Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isLoading,
      refreshSession,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
