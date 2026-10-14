import { NextResponse } from "next/server"

/**
 * Legacy email/password login endpoint - DISABLED
 * 
 * PiAds now uses Pi Network authentication only.
 * Email/password login has been removed for security and compliance.
 * 
 * Use /api/auth/pi-login instead.
 */
export async function POST() {
  return NextResponse.json(
    { 
      error: "Email/password login is disabled. Please use Pi Network authentication.",
      useEndpoint: "/api/auth/pi-login" 
    }, 
    { status: 403 }
  )
}
