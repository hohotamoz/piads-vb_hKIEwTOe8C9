/**
 * Pi Network session management.
 * The cookie contains only a signed Pi UID, never the Pi access token.
 */
import { cookies } from "next/headers"
import { createSessionToken, verifySessionToken } from "./pi-auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

const SESSION_COOKIE_NAME = "piads_session"
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60

export interface SessionData {
  id: string
  piUid: string
  username: string
  email: string
  name: string
  role: string
  avatar: string | null
  verified: boolean
  stats: Record<string, unknown>
  createdAt: string
}

export async function createSession(piUid: string, _username: string): Promise<string> {
  const token = createSessionToken(piUid)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  })
  return token
}

export type SessionCheckReason =
  | "ok"
  | "missing_cookie"
  | "invalid_cookie"
  | "profile_lookup_error"
  | "profile_not_found"

export async function getSessionWithStatus(): Promise<{ session: SessionData | null; reason: SessionCheckReason }> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return { session: null, reason: "missing_cookie" }

  const { piUid, valid } = verifySessionToken(token)
  if (!valid || !piUid) return { session: null, reason: "invalid_cookie" }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, pi_uid, username, email, name, role, avatar, verified, stats, created_at")
    .eq("pi_uid", piUid)
    .maybeSingle()

  if (error) {
    // Do not return database details to clients; server logs contain the diagnostic.
    console.error("[Pi Session] Profile lookup failed:", error.message)
    return { session: null, reason: "profile_lookup_error" }
  }
  if (!profile) return { session: null, reason: "profile_not_found" }

  return {
    reason: "ok",
    session: {
      id: profile.id,
      piUid,
      username: profile.username || "",
      email: profile.email || "",
      name: profile.name || profile.username || "Pi Pioneer",
      role: profile.role || "user",
      avatar: profile.avatar || null,
      verified: profile.verified ?? true,
      stats: profile.stats || {},
      createdAt: profile.created_at || new Date().toISOString(),
    },
  }
}

export async function getSession(): Promise<SessionData | null> {
  return (await getSessionWithStatus()).session
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null
}
