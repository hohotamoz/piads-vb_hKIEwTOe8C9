import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/** Google/Facebook/Supabase OAuth is retired. Pi Network is the only login provider. */
export async function GET(request: NextRequest) {
  const url = new URL("/auth/login?error=pi_only_auth", request.url)
  return NextResponse.redirect(url)
}
