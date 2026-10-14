"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  username: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in by checking session
    const checkSession = async () => {
      try {
        // The session is managed via HTTP-only cookies
        // We can check if we're authenticated by making a lightweight request
        // or just assume we're not authenticated on first load
        setIsLoading(false)
      } catch (error) {
        console.error("[AuthProvider] Session check error:", error)
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      window.location.href = "/"
    } catch (error) {
      console.error("[AuthProvider] Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
