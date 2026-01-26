"use client"

import { BlobBackground } from "./decorative-shapes"

interface AuthLayoutProps {
  children: React.ReactNode
  variant?: "dark" | "light"
}

export function AuthLayout({ children, variant = "light" }: AuthLayoutProps) {
  const isDark = variant === "dark"

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? "bg-[#1E1B4B]" : "bg-[#F8F7FF]"}`}>
      {/* Background with decorative shapes */}
      <BlobBackground variant={variant} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  )
}
