"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, UserRole } from "@/lib/auth"
import { getCurrentUser, signIn, signOut, signUp, isCurrentUserAdmin } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<User>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[v0] Checking authentication...")
        let currentUser = getCurrentUser()

        // Hydrate from Cookies if LocalStorage is empty (e.g. after Social Login redirect)
        if (!currentUser && typeof document !== "undefined") {
          const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=')
            acc[key] = value
            return acc
          }, {} as Record<string, string>)

          const authToken = cookies['auth_token']
          const userEmail = cookies['user_email']

          if (authToken && userEmail) {
            console.log("[v0] Hydrating session from cookies...", userEmail)
            try {
              // Fetch latest profile from Supabase
              const { supabase } = await import("@/lib/supabase")
              const { data: profile } = await supabase.from('profiles').select('*').eq('id', authToken).single()

              if (profile) {
                currentUser = {
                  id: profile.id,
                  email: profile.email,
                  name: profile.name || "User",
                  role: profile.role as UserRole,
                  avatar: profile.avatar || undefined,
                  verified: profile.verified,
                  createdAt: new Date(profile.created_at),
                  preferences: profile.preferences,
                  stats: profile.stats,
                  isMigrated: true
                }
                // Sync back to localStorage
                if (typeof window !== "undefined") {
                  localStorage.setItem("currentUser", JSON.stringify(currentUser))
                }
              }
            } catch (err) {
              console.error("[v0] Cookie hydration failed:", err)
            }
          }
        }

        console.log("[v0] Current user:", currentUser ? currentUser.email : "None")
        setUser(currentUser)

        if (currentUser && typeof document !== "undefined") {
          document.cookie = `auth_token=${currentUser.id}; path=/; max-age=86400`
          document.cookie = `user_email=${currentUser.email}; path=/; max-age=86400`
        }
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
        console.log("[v0] Auth check complete")
      }
    }

    // Add small delay to prevent white screen
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const userData = await signIn(email, password)
      if (userData) {
        setUser(userData)
        if (typeof document !== "undefined") {
          document.cookie = `auth_token=${userData.id}; path=/; max-age=86400`
          document.cookie = `user_email=${userData.email}; path=/; max-age=86400`
        }
        return userData
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      console.error("Login error in provider:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      console.log("[v0] Starting signup process...")
      setIsLoading(true)
      const userData = await signUp(email, password, name, role)
      console.log("[v0] Signup successful, user:", userData.email)
      setUser(userData)

      if (typeof document !== "undefined") {
        document.cookie = `auth_token=${userData.id}; path=/; max-age=86400`
        document.cookie = `user_email=${userData.email}; path=/; max-age=86400`
      }

      return userData
    } catch (error) {
      console.error("[v0] Signup error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    signOut()
    setUser(null)
    if (typeof document !== "undefined") {
      document.cookie = "auth_token=; path=/; max-age=0"
      document.cookie = "user_email=; path=/; max-age=0"
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: isCurrentUserAdmin(),
        isLoading,
        login,
        logout,
        signup,
        updateUser,
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
