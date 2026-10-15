"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { PiAuthProvider } from "@/contexts/pi-auth-context"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/sonner"

export function AppWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/auth/login"

  return (
    <PiAuthProvider>
      <AuthProvider>
        <div className={isLoginPage ? undefined : "piads-premium-shell"}>
          {children}
        </div>
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </PiAuthProvider>
  )
}
