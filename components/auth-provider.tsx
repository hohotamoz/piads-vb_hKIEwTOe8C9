"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { User, UserRole } from "@/lib/auth"
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

// ✅ SINGLE LISTENER FLAG - Prevents duplicate listeners
let authListenerInitialized = false

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        // ✅ STEP 1: Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (isMounted) {
          if (session?.user) {
            setUser(mapSupabaseUser(session.user))
          } else {
            setUser(null)
          }
          setIsLoading(false)
        }

        // ✅ STEP 2: Set up ONE listener (not multiple)
        if (!authListenerInitialized) {
          authListenerInitialized = true

          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (isMounted) {
              if (session?.user) {
                setUser(mapSupabaseUser(session.user))
              } else {
                setUser(null)
              }
            }
          })

          unsubscribeRef.current = () => {
            subscription.unsubscribe()
            authListenerInitialized = false
          }
        }
      } catch (error) {
        console.error("[AuthProvider] Error initializing auth:", error)
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
      // Cleanup subscription on unmount (but keep flag for re-mounts)
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [])

  // ✅ Helper to map Supabase user to App user
  const mapSupabaseUser = (sbUser: any): User => {
    return {
      id: sbUser.id,
      email: sbUser.email || "",
      name:
        sbUser.user_metadata?.full_name ||
        sbUser.user_metadata?.name ||
        sbUser.email?.split("@")[0] ||
        "User",
      role: sbUser.user_metadata?.role || "user",
      avatar: sbUser.user_metadata?.avatar_url,
      verified: !!sbUser.email_confirmed_at,
      createdAt: new Date(sbUser.created_at),
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // State update happens via onAuthStateChange listener
      return mapSupabaseUser(data.user)
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          },
        },
      })
      if (error) throw error
      if (data.user) return mapSupabaseUser(data.user)
      throw new Error("Signup successful but no user returned")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("[AuthProvider] Logout error:", error)
    } finally {
      setIsLoading(false)
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
        isAdmin: user?.role === "admin",
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
