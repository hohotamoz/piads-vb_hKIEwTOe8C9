/**
 * Pi Network Authentication Utilities
 * Server-side verification with Platform API
 */

export interface PiVerifiedUser {
  uid: string
  username: string
  accessToken: string
}

/**
 * Verify Pi access token with Platform API
 * Uses GET /v2/me with Bearer token
 */
export async function verifyPiAccessToken(accessToken: string): Promise<PiVerifiedUser | null> {
  try {
    const apiUrl = process.env.PI_API_URL || "https://api.minepi.com"
    
    const response = await fetch(`${apiUrl}/v2/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("[Pi Auth] Token verification failed:", response.status)
      return null
    }

    const data = await response.json()
    
    if (!data.uid) {
      console.error("[Pi Auth] Invalid response from Pi API")
      return null
    }

    return {
      uid: data.uid,
      username: data.username || "",
      accessToken,
    }
  } catch (error) {
    console.error("[Pi Auth] Verification error:", error)
    return null
  }
}

/**
 * Create a secure session token for the user
 */
export function createSessionToken(piUid: string): string {
  const crypto = require("crypto")
  const timestamp = Date.now().toString()
  const random = crypto.randomBytes(16).toString("hex")
  const data = `${piUid}:${timestamp}:${random}`
  const secret = process.env.SESSION_SECRET || "piads-dev-secret-change-in-production"
  const signature = crypto.createHmac("sha256", secret).update(data).digest("hex")
  return `${Buffer.from(data).toString("base64url")}.${signature}`
}

/**
 * Verify a session token
 */
export function verifySessionToken(token: string): { piUid: string; valid: boolean } {
  try {
    const crypto = require("crypto")
    const [encodedData, signature] = token.split(".")
    
    if (!encodedData || !signature) {
      return { piUid: "", valid: false }
    }

    const data = Buffer.from(encodedData, "base64url").toString()
    const secret = process.env.SESSION_SECRET || "piads-dev-secret-change-in-production"
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("hex")
    
    if (signature !== expectedSignature) {
      return { piUid: "", valid: false }
    }

    const [piUid, timestamp] = data.split(":")
    
    // Check if session is older than 7 days
    const sessionAge = Date.now() - parseInt(timestamp)
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
    
    if (sessionAge > maxAge) {
      return { piUid: "", valid: false }
    }

    return { piUid, valid: true }
  } catch (error) {
    console.error("[Pi Auth] Session verification error:", error)
    return { piUid: "", valid: false }
  }
}
