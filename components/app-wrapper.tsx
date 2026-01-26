"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { PiAuthProvider } from "@/contexts/pi-auth-context"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/sonner"
import { cleanupAllDemoData } from "@/lib/cleanup-demo-data"
import { migrateLocalDataToSupabase } from "@/lib/migration"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { initAuthBridge } from "@/lib/auth"

export function AppWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 1. Cleanup demo data
    cleanupAllDemoData()
    // 2. Init Auth Bridge (Sync Social Login)
    initAuthBridge()

    // 2. Check Supabase Connection
    const checkConnection = async () => {
      if (!isSupabaseConfigured) {
        console.log("⚠️ Supabase is NOT configured. Running in offline mode.")
        return
      }
      try {
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
        if (error) {
          console.error("❌ Supabase connection failed:", error.message)
        } else {
          console.log("✅ Supabase Connected Successfully!")
          // 3. Trigger Migration
          migrateLocalDataToSupabase()
        }
      } catch (e) {
        console.error("❌ Supabase connection error:", e)
      }
    }

    checkConnection()
  }, [])

  return (
    <PiAuthProvider>
      <AuthProvider>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </PiAuthProvider>
  )
}
