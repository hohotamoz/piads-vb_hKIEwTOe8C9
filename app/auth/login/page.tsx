"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthLayout } from "@/components/auth-layout"
import { ArrowRight, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { signInWithProvider } from "@/lib/auth"
import { PiLoginButton } from "@/components/pi-login-button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPiBrowser, setIsPiBrowser] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check for Pi Browser environment
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent
      if (ua.includes("PiBrowser") || (window as any).Pi) {
        setIsPiBrowser(true)
      }
    }
  }, [])

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true)
    setError("")
    try {
      const { error } = await signInWithProvider(provider)
      if (error) throw error
      // Redirect happens automatically by Supabase
    } catch (err: any) {
      setError(err?.message || `Failed to login with ${provider}`)
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await login(email, password)

      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      if (currentUser && currentUser.role === "admin") {
        window.location.href = "/admin"
      } else {
        window.location.href = "/"
      }
    } catch (error: any) {
      setError(error?.message || "Invalid email or password. Please check your credentials.")
      console.error("Login failed:", error)
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout variant="dark">
      <div className="w-full max-w-sm animate-slide-up mx-auto px-4">
        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-8 tracking-widest-custom uppercase">
          Welcome Back
        </h1>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-500/30 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pi Login Button (Only visible in Pi Browser) */}
        <div className="mb-6">
          <PiLoginButton />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 h-14 bg-[#2D2A5E]/60 border-0 text-white placeholder:text-white/50 rounded-2xl focus:ring-2 focus:ring-amber-400/50"
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12 h-14 bg-[#2D2A5E]/60 border-0 text-white placeholder:text-white/50 rounded-2xl focus:ring-2 focus:ring-amber-400/50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-white/70 hover:text-amber-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#1E1B4B] font-bold rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Social Login - Hidden in Pi Browser */}
        {!isPiBrowser && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-sm text-white/50">or</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#fff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#fff"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fff"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#fff"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#fff">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Register Link */}
        <p className="text-center text-sm text-white/70 mt-8">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
