"use client"

import type { ReactNode } from "react"
import { PiAuthProvider } from "@/contexts/pi-auth-context"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/sonner"

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <AuthProvider>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </PiAuthProvider>
  )
}
