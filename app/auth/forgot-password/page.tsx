"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthLayout } from "@/components/auth-layout"
import { ArrowLeft, Mail, Loader2, AlertCircle, CheckCircle2, Send } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSuccess(true)
    } catch (err: any) {
      setError(err?.message || "Failed to send reset link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout variant="light">
      <div className="w-full max-w-sm animate-slide-up mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-[#5B4B9E] hover:text-amber-500 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#1E1B4B] text-center mb-4 tracking-widest-custom uppercase">
          Reset Password
        </h1>
        <p className="text-center text-[#5B4B9E]/70 mb-8">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {isSuccess ? (
          /* Success State */
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1E1B4B] mb-2">Check your email</h2>
            <p className="text-[#5B4B9E]/70 mb-6">
              We've sent a password reset link to{" "}
              <span className="font-medium text-[#1E1B4B]">{email}</span>
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSuccess(false)
                setEmail("")
              }}
              className="h-12 px-6 border-[#5B4B9E]/30 text-[#5B4B9E] hover:bg-[#5B4B9E]/10 rounded-full"
            >
              Try another email
            </Button>
          </div>
        ) : (
          /* Form State */
          <>
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5B4B9E]/50" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-[#FEF3E2]/80 border-0 text-[#1E1B4B] placeholder:text-[#5B4B9E]/50 rounded-2xl focus:ring-2 focus:ring-amber-400/50"
                  required
                />
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
                    <Send className="w-5 h-5 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          </>
        )}

        {/* Login Link */}
        <p className="text-center text-sm text-[#5B4B9E]/70 mt-8">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-amber-500 font-semibold hover:text-amber-600 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
