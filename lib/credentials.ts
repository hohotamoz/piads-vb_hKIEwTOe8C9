// Credentials storage and validation system
const CREDENTIALS_KEY = "piads_credentials"

export interface UserCredentials {
  email: string
  passwordHash: string
  createdAt: Date
}

// Simple hash function for password storage
export function hashPassword(password: string): string {
  // In production, use proper hashing like bcrypt
  // For now, using a simple hash with salt
  const salt = "piads_secure_salt_2024"
  let hash = 0
  const combined = password + salt

  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  return hash.toString(36)
}

// Get all credentials from storage
function getAllCredentials(): Map<string, UserCredentials> {
  if (typeof window === "undefined") return new Map()

  try {
    const data = localStorage.getItem(CREDENTIALS_KEY)
    if (!data) return new Map()

    const parsed = JSON.parse(data)
    return new Map(Object.entries(parsed))
  } catch (error) {
    console.error("Error loading credentials:", error)
    return new Map()
  }
}

// Save credentials to storage
function saveCredentials(credentials: Map<string, UserCredentials>): void {
  if (typeof window === "undefined") return

  try {
    const obj = Object.fromEntries(credentials)
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(obj))
  } catch (error) {
    console.error("Error saving credentials:", error)
  }
}

// Store user credentials
export function storeCredentials(email: string, password: string): void {
  const emailLower = email.toLowerCase().trim()
  const credentials = getAllCredentials()

  credentials.set(emailLower, {
    email: emailLower,
    passwordHash: hashPassword(password),
    createdAt: new Date()
  })

  saveCredentials(credentials)
}

// Verify user credentials
export function verifyCredentials(email: string, password: string): boolean {
  const emailLower = email.toLowerCase().trim()
  const credentials = getAllCredentials()

  const userCreds = credentials.get(emailLower)
  if (!userCreds) {
    return false
  }

  const passwordHash = hashPassword(password)
  return userCreds.passwordHash === passwordHash
}

// Check if user has stored credentials
export function hasStoredCredentials(email: string): boolean {
  const emailLower = email.toLowerCase().trim()
  const credentials = getAllCredentials()
  return credentials.has(emailLower)
}

// Delete user credentials
export function deleteCredentials(email: string): void {
  const emailLower = email.toLowerCase().trim()
  const credentials = getAllCredentials()
  credentials.delete(emailLower)
  saveCredentials(credentials)
}
