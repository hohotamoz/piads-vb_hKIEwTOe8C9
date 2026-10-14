/**
 * Pi Network Authentication Tests
 * 
 * Tests for the Pi authentication flow including:
 * - Token verification with Platform API
 * - Session creation and validation
 * - User identity verification
 */

import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock environment variables
const MOCK_PI_API_KEY = "test_api_key_12345"
const MOCK_SESSION_SECRET = "test_session_secret"

describe("Pi Authentication", () => {
  beforeEach(() => {
    vi.stubEnv("PI_API_KEY", MOCK_PI_API_KEY)
    vi.stubEnv("SESSION_SECRET", MOCK_SESSION_SECRET)
  })

  describe("verifyPiAccessToken", () => {
    it("should verify a valid Pi access token", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          uid: "test-uid-123",
          username: "testuser",
          credentials: { scopes: ["username", "payments"] }
        })
      })
      vi.stubGlobal("fetch", mockFetch)

      const { verifyPiAccessToken } = await import("@/lib/pi-auth")
      const result = await verifyPiAccessToken("valid_token_123")

      expect(result).not.toBeNull()
      expect(result?.uid).toBe("test-uid-123")
      expect(result?.username).toBe("testuser")
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v2/me"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer valid_token_123"
          })
        })
      )
    })

    it("should return null for an invalid token", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      })
      vi.stubGlobal("fetch", mockFetch)

      const { verifyPiAccessToken } = await import("@/lib/pi-auth")
      const result = await verifyPiAccessToken("invalid_token")

      expect(result).toBeNull()
    })

    it("should return null when API returns no uid", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ username: "testuser" })
      })
      vi.stubGlobal("fetch", mockFetch)

      const { verifyPiAccessToken } = await import("@/lib/pi-auth")
      const result = await verifyPiAccessToken("valid_token")

      expect(result).toBeNull()
    })
  })

  describe("createSessionToken", () => {
    it("should create a valid session token", async () => {
      const { createSessionToken } = await import("@/lib/pi-auth")
      const token = createSessionToken("test-uid-123")

      expect(token).toBeDefined()
      expect(typeof token).toBe("string")
      expect(token.split(".")).toHaveLength(2)
    })

    it("should create unique tokens for same user", async () => {
      const { createSessionToken } = await import("@/lib/pi-auth")
      const token1 = createSessionToken("test-uid-123")
      const token2 = createSessionToken("test-uid-123")

      expect(token1).not.toBe(token2)
    })
  })

  describe("verifySessionToken", () => {
    it("should verify a valid session token", async () => {
      const { createSessionToken, verifySessionToken } = await import("@/lib/pi-auth")
      const token = createSessionToken("test-uid-123")
      const result = verifySessionToken(token)

      expect(result.valid).toBe(true)
      expect(result.piUid).toBe("test-uid-123")
    })

    it("should reject an invalid session token", async () => {
      const { verifySessionToken } = await import("@/lib/pi-auth")
      const result = verifySessionToken("invalid.token.here")

      expect(result.valid).toBe(false)
    })

    it("should reject a tampered token", async () => {
      const { createSessionToken, verifySessionToken } = await import("@/lib/pi-auth")
      const token = createSessionToken("test-uid-123")
      const tampered = token.slice(0, -5) + "XXXXX"
      const result = verifySessionToken(tampered)

      expect(result.valid).toBe(false)
    })
  })
})
