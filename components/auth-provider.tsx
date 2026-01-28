"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, UserRole } from "@/lib/auth"
import { getCurrentUser, signIn, signOut, signUp, isCurrentUserAdmin } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

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
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Map to your User type
          setUser(mapSupabaseUser(session.user))
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error getting session:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Helper to map Supabase user to App user
  const mapSupabaseUser = (sbUser: any): User => {
    return {
      id: sbUser.id,
      email: sbUser.email || "",
      name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || "User",
      role: sbUser.user_metadata?.role || "user", // Ensure role is in metadata or fetch profile if needed
      avatar: sbUser.user_metadata?.avatar_url,
      verified: !!sbUser.email_confirmed_at,
      createdAt: new Date(sbUser.created_at)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setIsLoading(false)
      throw error
    }
    // State update happens in onAuthStateChange
    return mapSupabaseUser(data.user)
  }

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role
        }
      }
    })
    if (error) {
      setIsLoading(false)
      throw error
    }
    // If auto-confirm is off, user might be null here, but typically for this app it signs in
    if (data.user) return mapSupabaseUser(data.user)
    throw new Error("Signup successful but no user returned")
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    // Clear any custom cookies if used
    if (typeof document !== "undefined") {
      document.cookie = "auth_token=; path=/; max-age=0"
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin', // Simplify check
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
