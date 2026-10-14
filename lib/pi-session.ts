/**
 * Pi Network Session Management
 * Server-side session handling with secure cookies
 */

import { cookies } from "next/headers"
import { createSessionToken, verifySessionToken } from "./pi-auth"

const SESSION_COOKIE_NAME = "piads_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface SessionData {
  piUid: string
  username: string
  accessToken: string
  createdAt: number
}

/**
 * Create a new session for a Pi user
 */
export async function createSession(piUid: string, username: string, accessToken: string): Promise<string> {
  const sessionData: SessionData = {
    piUid,
    username,
    accessToken,
    createdAt: Date.now(),
  }

  const token = createSessionToken(piUid)
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })

  return token
}

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  const { piUid, valid } = verifySessionToken(token)
  
  if (!valid) return null

  // Note: We don't store accessToken in the cookie for security
  // The session is validated by the signature
  return {
    piUid,
    username: "", // Will be populated from user data if needed
    accessToken: "", // Not stored in session for security
    createdAt: Date.now(),
  }
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}
