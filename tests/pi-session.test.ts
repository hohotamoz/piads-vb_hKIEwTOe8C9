/**
 * Pi Session Management Tests
 * 
 * Tests for session creation, validation, and security
 */

import { describe, it, expect, beforeEach, vi } from "vitest"

const MOCK_SESSION_SECRET = "test_session_secret_key_12345"

describe("Pi Session Management", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", MOCK_SESSION_SECRET)
  })

  describe("Session Token Creation", () => {
    it("should create a session token with correct format", async () => {
      const { createSessionToken } = await import("@/lib/pi-auth")
      const token = createSessionToken("user-123")

      expect(token).toBeDefined()
      expect(typeof token).toBe("string")
      
      const parts = token.split(".")
      expect(parts).toHaveLength(2)
      expect(parts[0].length).toBeGreaterThan(0)
      expect(parts[1].length).toBeGreaterThan(0)
    })

    it("should create different tokens for different users", async () => {
      const { createSessionToken } = await import("@/lib/pi-auth")
      const token1 = createSessionToken("user-123")
      const token2 = createSessionToken("user-456")

      expect(token1).not.toBe(token2)
    })

    it("should create unique tokens for same user at different times", async () => {
      const { createSessionToken } = await import("@/lib/pi-auth")
      const token1 = createSessionToken("user-123")
      
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const token2 = createSessionToken("user-123")
      expect(token1).not.toBe(token2)
    })
  })

  describe("Session Token Verification", () => {
    it("should verify a valid token", async () => {
      const { createSessionToken, verifySessionToken } = await import("@/lib/pi-auth")
      const token = createSessionToken("user-123")
      const result = verifySessionToken(token)

      expect(result.valid).toBe(true)
      expect(result.piUid).toBe("user-123")
    })

    it("should reject a malformed token", async () => {
      const { verifySessionToken } = await import("@/lib/pi-auth")
      const result = verifySessionToken("not.a.valid.token")

      expect(result.valid).toBe(false)
    })

    it("should reject a token with invalid signature", async () => {
      const { createSessionToken, verifySessionToken } = await import("@/lib/pi-auth")
      const token = createSessionToken("user-123")
      const tampered = token.slice(0, -10) + "XXXXXXXXXX"
      const result = verifySessionToken(tampered)

      expect(result.valid).toBe(false)
    })

    it("should reject an empty token", async () => {
      const { verifySessionToken } = await import("@/lib/pi-auth")
      const result = verifySessionToken("")

      expect(result.valid).toBe(false)
    })
  })

  describe("Session Security", () => {
    it("should use HMAC-SHA256 for signing", async () => {
      const { createSessionToken } = await import("@/lib/pi-auth")
      const token = createSessionToken("user-123")
      const signature = token.split(".")[1]

      // Signature should be 64 characters (SHA256 hex)
      expect(signature).toHaveLength(64)
    })

    it("should include timestamp in token data", async () => {
      const { createSessionToken, verifySessionToken } = await import("@/lib/pi-auth")
      const before = Date.now()
      const token = createSessionToken("user-123")
      const after = Date.now()

      const result = verifySessionToken(token)
      expect(result.valid).toBe(true)
      
      // Decode the data part
      const data = Buffer.from(token.split(".")[0], "base64url").toString()
      const timestamp = parseInt(data.split(":")[1])
      
      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })
  })
})
