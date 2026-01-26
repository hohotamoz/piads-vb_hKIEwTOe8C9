"use client"

import type { ReactNode } from "react"
import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { isAdminEmail } from "@/lib/auth"

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user || !isAdmin || !isAdminEmail(user.email)) {
        router.replace("/")
      } else {
        setShouldRender(true)
      }
    }
  }, [user, isLoading, isAdmin, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Verifying Admin Access</p>
            <p className="text-xs text-slate-500 mt-1">Please wait...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin || !isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Alert className="max-w-md border-red-200 bg-red-50 shadow-lg">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-900 font-bold">Access Denied</AlertTitle>
          <AlertDescription className="text-red-800 mt-2">
            You don't have permission to access the admin panel. Only authorized administrators can view this page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-16 h-16">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-600" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
