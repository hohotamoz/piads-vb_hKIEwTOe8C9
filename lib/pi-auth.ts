/**
 * Pi Network authentication utilities.
 * Pi Platform API is the source of truth for the user's identity.
 */

export interface PiVerifiedUser {
  uid: string
  username: string
  accessToken: string
}

export async function verifyPiAccessToken(accessToken: string): Promise<PiVerifiedUser | null> {
  try {
    const apiUrl = (process.env.PI_API_URL || "https://api.minepi.com").replace(/\/$/, "")
    const response = await fetch(`${apiUrl}/v2/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      cache: "no-store",
    })
    if (!response.ok) {
      console.error("[Pi Auth] Token verification failed:", response.status)
      return null
    }
    const data = await response.json()
    if (typeof data?.uid !== "string" || !data.uid || typeof data?.username !== "string" || !data.username) {
      console.error("[Pi Auth] Pi API returned an incomplete identity")
      return null
    }
    return { uid: data.uid, username: data.username, accessToken }
  } catch (error) {
    console.error("[Pi Auth] Verification error:", error)
    return null
  }
}

function getSessionSecret(): string {
  const configured = process.env.SESSION_SECRET
  if (configured && configured.length >= 32) return configured
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters in production.")
  }
  return configured || "piads-local-development-secret-only"
}

export function createSessionToken(piUid: string): string {
  const crypto = require("crypto")
  const timestamp = Date.now().toString()
  const random = crypto.randomBytes(16).toString("hex")
  const data = `${piUid}:${timestamp}:${random}`
  const encoded = Buffer.from(data).toString("base64url")
  const signature = crypto.createHmac("sha256", getSessionSecret()).update(encoded).digest("hex")
  return `${encoded}.${signature}`
}

export function verifySessionToken(token: string): { piUid: string; valid: boolean } {
  try {
    const [encoded, signature] = token.split(".")
    if (!encoded || !signature || !/^[a-f0-9]{64}$/i.test(signature)) return { piUid: "", valid: false }
    const crypto = require("crypto")
    const expected = crypto.createHmac("sha256", getSessionSecret()).update(encoded).digest("hex")
    const actualBuffer = Buffer.from(signature, "hex")
    const expectedBuffer = Buffer.from(expected, "hex")
    if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
      return { piUid: "", valid: false }
    }
    const data = Buffer.from(encoded, "base64url").toString("utf8")
    const [piUid, timestamp] = data.split(":")
    const createdAt = Number(timestamp)
    const age = Date.now() - createdAt
    const maxAge = 7 * 24 * 60 * 60 * 1000
    if (!piUid || !Number.isFinite(createdAt) || age < 0 || age > maxAge) return { piUid: "", valid: false }
    return { piUid, valid: true }
  } catch (error) {
    console.error("[Pi Auth] Session verification error:", error)
    return { piUid: "", valid: false }
  }
}
