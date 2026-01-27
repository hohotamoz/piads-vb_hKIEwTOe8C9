import { supabase, isSupabaseConfigured } from './supabase'
import { verifyCredentials as verifyLocalCredentials, storeCredentials as storeLocalCredentials, hashPassword } from './credentials'

export type UserRole = "user" | "advertiser" | "store" | "developer" | "admin"

// Support both .com and .cm for admin email (user typo tolerance)
export const ADMIN_EMAILS = ["hohotamoz200@gmail.com", "hohotamoz200@gmail.cm"]
export const ADMIN_EMAIL = ADMIN_EMAILS[0]

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  verified: boolean
  createdAt: Date
  preferences?: {
    notifications: boolean
    pushNotifications: boolean
    emailNotifications: boolean
    locationSharing: boolean
    profileVisibility: string
    twoFactorEnabled: boolean
    phone: string
    categories?: string[]
    regions?: string[]
    language?: string
  }
  stats?: {
    totalAds?: number
    totalRatings?: number
    averageRating?: number
    piBalance?: number
  }
  isMigrated?: boolean
}

export const DEFAULT_PREFERENCES: NonNullable<User["preferences"]> = {
  notifications: true,
  pushNotifications: true,
  emailNotifications: true,
  locationSharing: false,
  profileVisibility: "public",
  twoFactorEnabled: false,
  phone: "",
  categories: [],
  regions: [],
  language: "en"
}

// Storage key for users (fallback)
const USERS_STORAGE_KEY = "piads_users"
const CURRENT_USER_KEY = "currentUser"

// --- Helper Functions ---

// Get all users from storage (Fallback)
function getAllUsersLocal(): User[] {
  if (typeof window === "undefined") return []
  try {
    const usersData = localStorage.getItem(USERS_STORAGE_KEY)
    if (!usersData) return []
    const users = JSON.parse(usersData)
    return Array.isArray(users) ? users : []
  } catch (error) {
    console.error("Error loading users local:", error)
    return []
  }
}

// Save users to storage (Fallback)
function saveUsersLocal(users: User[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (error) {
    console.error("Error saving users local:", error)
  }
}

export function isAdminEmail(email: string): boolean {
  const emailLower = email.toLowerCase().trim()
  return ADMIN_EMAILS.some(adminEmail => emailLower === adminEmail.toLowerCase())
}

// --- Main Auth Functions ---

export async function signIn(email: string, password: string): Promise<User | null> {
  const emailLower = email.toLowerCase().trim()
  if (!email || !password) return null

  // 1. Try Supabase Auth (The Source of Truth)
  if (isSupabaseConfigured) {
    try {
      // First, try standard Auth login (Gets a real session)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailLower,
        password: password
      })

      if (!authError && authData.user) {
        // Success! Fetch full profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('email', emailLower).single()

        // Return structured user
        const user: User = {
          id: profile?.id || authData.user.id,
          email: authData.user.email!,
          name: profile?.name || authData.user.user_metadata.full_name || "User",
          role: (profile?.role as UserRole) || 'user',
          avatar: profile?.avatar || undefined,
          verified: profile?.verified || false,
          createdAt: new Date(authData.user.created_at),
          preferences: profile?.preferences,
          stats: profile?.stats,
          isMigrated: true
        }

        saveUserSession(user)
        return user
      }

      // If Auth failed, it might be a Legacy User (Profile exists, but no Auth User)
      // Check legacy profile hash
      const { data: profile } = await supabase.from('profiles').select('*').eq('email', emailLower).single()

      if (profile && profile.password_hash) {
        // Verify Hash
        const salt = "piads_secure_salt_2024"
        let hash = 0
        const combined = password + salt
        for (let i = 0; i < combined.length; i++) {
          const char = combined.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash
        }
        const computedHash = hash.toString(36)

        if (profile.password_hash === computedHash) {
          // Migrating Legacy User: Create Real Auth User
          console.log("[Auth] Migrating legacy user to Supabase Auth...")
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: emailLower,
            password: password,
            options: {
              data: {
                full_name: profile.name,
                role: profile.role
              }
            }
          })

          if (!signUpError && signUpData.user) {
            // Auto-login after migration
            const user: User = {
              id: signUpData.user.id, // NOTE: This ID might differ from profile.id if profile has legacy ID
              email: emailLower,
              name: profile.name,
              role: profile.role as UserRole,
              verified: profile.verified,
              createdAt: new Date(),
              isMigrated: true
            }
            saveUserSession(user)
            return user
          }
        }
      }

    } catch (e) {
      console.warn("Supabase login failed", e)
    }
  }

  // 2. Fallback: Local Storage Login (If Offline)
  const users = getAllUsersLocal()
  const user = users.find(u => u.email.toLowerCase() === emailLower)

  if (user) {
    const { verifyCredentials } = await import("./credentials")
    if (verifyCredentials(emailLower, password)) {
      if (isSupabaseConfigured) {
        syncUserToSupabase(user, password).catch(console.error)
      }
      saveUserSession(user)
      return user
    }
  }

  // 3. Admin Fallback
  if (isAdminEmail(emailLower)) {
    const { verifyCredentials, hasStoredCredentials } = await import("./credentials")
    if (hasStoredCredentials(emailLower)) {
      if (!verifyCredentials(emailLower, password)) return null
    }
    const adminUser: User = {
      id: "admin-master",
      email: emailLower,
      name: "System Administrator",
      role: "admin",
      verified: true,
      createdAt: new Date(),
      stats: { piBalance: 10000, totalAds: 0 },
    }
    saveUserSession(adminUser)
    return adminUser
  }

  return null
}

export async function signUp(email: string, password: string, name: string, role: UserRole): Promise<User> {
  const emailLower = email.toLowerCase().trim()
  if (!password || password.length < 8) throw new Error("Password must be at least 8 characters")

  // 1. Check Supabase for existing user
  if (isSupabaseConfigured) {
    const { data: existing } = await supabase.from('profiles').select('email').eq('email', emailLower).single()
    if (existing) throw new Error("User with this email already exists (Cloud)")
  }

  // 2. Check Local for existing user
  const usersLocal = getAllUsersLocal()
  if (usersLocal.some(u => u.email.toLowerCase() === emailLower)) {
    throw new Error("User with this email already exists (Local)")
  }

  // 3. Create User
  const safeRole = (role === "admin" && !isAdminEmail(emailLower)) ? "user" : role

  // Hash Password
  const salt = "piads_secure_salt_2024"
  let hash = 0
  const combined = password + salt
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const passwordHash = hash.toString(36)

  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: emailLower,
    name,
    role: safeRole,
    verified: true,
    createdAt: new Date(),
    stats: { piBalance: 100, totalAds: 0 },
  }

  // Save to Supabase
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('profiles').insert({
        email: emailLower,
        name,
        role: safeRole,
        verified: true,
        password_hash: passwordHash,
        stats: newUser.stats,
        created_at: newUser.createdAt.toISOString()
      }).select().single()

      if (!error && data) {
        newUser.id = data.id // Use UUID from Supabase
        newUser.isMigrated = true
      } else {
        console.error("Supabase signup error:", error)
        // Continue to verify local save even if cloud fails? 
        // Better to fail if cloud is supposed to be primary, but we want offline support.
      }
    } catch (e) {
      console.error("Supabase connection error:", e)
    }
  }

  // Save Local (Backup/Offline)
  usersLocal.push(newUser)
  saveUsersLocal(usersLocal)

  // Store Credentials Local
  const { storeCredentials } = await import("./credentials")
  storeCredentials(emailLower, password)

  saveUserSession(newUser)
  return newUser
}

// --- OAuth Provider Login ---
export async function signInWithProvider(provider: 'google' | 'facebook', nextUrl?: string): Promise<{ error: any }> {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured for OAuth")
    return { error: { message: "Social login requires Supabase configuration" } }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const callbackUrl = new URL(`${origin}/auth/callback`)
  if (nextUrl) {
    callbackUrl.searchParams.set('next', nextUrl)
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: callbackUrl.toString(),
    }
  })

  return { error }
}

// --- Auth State Bridge ---
// Call this in your main layout or auth provider to sync Supabase Auth state to local profile
export function initAuthBridge(): () => void {
  if (!isSupabaseConfigured) return () => { }

  const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      console.log("[Auth Bridge] Supabase User Signed In:", session.user.email)

      const email = session.user.email
      if (!email) return

      try {
        // 1. Check if profile exists
        let { data: profile, error: fetchError } = await supabase.from('profiles').select('*').eq('email', email).single()

        // 2. If not, create one
        if (!profile && (!fetchError || fetchError.code === 'PGRST116')) { // PGRST116 is "Row not found"
          console.log("[Auth Bridge] Creating profile for OAuth user...")
          const name = session.user.user_metadata.full_name || session.user.user_metadata.name || email.split('@')[0]
          const avatar = session.user.user_metadata.avatar_url || session.user.user_metadata.picture

          // Use upsert to handle race conditions where profile might be created by trigger or parallel request
          const { data: newProfile, error } = await supabase.from('profiles').upsert({
            id: session.user.id, // Use Supabase Auth UUID
            email: email,
            name: name,
            avatar: avatar,
            role: 'user',
            verified: true, // Social login implies verification
            created_at: new Date().toISOString()
          }, { onConflict: 'id' }).select().single()

          if (error) {
            // Ignore AbortError which happens on page reload/unmount during request
            if (!error.message?.includes('AbortError')) {
              console.error("[Auth Bridge] Failed to create profile:", error)
            }
          } else {
            profile = newProfile
          }
        }

        // 3. Save to Local Session (Bridge to Legacy Auth)
        if (profile) {
          const user: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name || "User",
            role: profile.role as UserRole,
            avatar: profile.avatar || undefined,
            verified: profile.verified,
            createdAt: new Date(profile.created_at),
            preferences: profile.preferences,
            stats: profile.stats,
            isMigrated: true
          }
          saveUserSession(user)
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("[Auth Bridge] Unexpected error:", err)
        }
      }
    } else if (event === 'SIGNED_OUT') {
      signOut()
    }
  })

  return () => {
    authListener.subscription.unsubscribe()
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY)
    if (!userStr) return null
    const user = JSON.parse(userStr)
    return user
  } catch (error) {
    return null
  }
}

export function isCurrentUserAdmin(): boolean {
  const user = getCurrentUser()
  return user !== null && user.role === "admin" && isAdminEmail(user.email)
}

export function signOut(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

export async function updateUserPreferences(userId: string, preferences: Partial<User["preferences"]>): Promise<void> {
  // Update Local
  const users = getAllUsersLocal()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex !== -1) {
    const currentPrefs = users[userIndex].preferences || DEFAULT_PREFERENCES
    users[userIndex].preferences = {
      ...DEFAULT_PREFERENCES,
      ...currentPrefs, // Keep existing values
      ...preferences   // Overwrite with new updates
    }
    saveUsersLocal(users)
  }

  // Update Session
  const currentUser = getCurrentUser()
  if (currentUser && currentUser.id === userId) {
    const currentPrefs = currentUser.preferences || DEFAULT_PREFERENCES
    const newPrefs = {
      ...DEFAULT_PREFERENCES,
      ...currentPrefs,
      ...preferences
    }
    const updatedUser = { ...currentUser, preferences: newPrefs }
    saveUserSession(updatedUser)
  }

  // Update Supabase
  if (isSupabaseConfigured) {
    await supabase.from('profiles').update({ preferences: preferences }).eq('id', userId)
  }
}

export async function updateUserProfile(userId: string, data: { name?: string; email?: string }): Promise<void> {
  // Update Local
  const users = getAllUsersLocal()
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...data }
    saveUsersLocal(users)
  }

  // Update Session
  const currentUser = getCurrentUser()
  if (currentUser && currentUser.id === userId) {
    const updatedUser = { ...currentUser, ...data }
    saveUserSession(updatedUser)
  }

  // Update Supabase
  if (isSupabaseConfigured) {
    await supabase.from('profiles').update(data).eq('id', userId)
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const salt = "piads_secure_salt_2024"
  let hash = 0
  const combined = newPassword + salt
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const passwordHash = hash.toString(36)

  // Update Supabase
  if (isSupabaseConfigured) {
    await supabase.from('profiles').update({ password_hash: passwordHash }).eq('id', userId)
  }

  // Note: We don't update local password storage here for security/simplicity in this mixed mode.
  // Ideally clear local creds or re-login.
}

// --- Internal Helper: Sync Local User to Supabase ---
async function syncUserToSupabase(user: User, passwordRaw: string): Promise<void> {
  if (!isSupabaseConfigured) return

  // Hash generic
  const salt = "piads_secure_salt_2024"
  let hash = 0
  const combined = passwordRaw + salt
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const passwordHash = hash.toString(36)

  // Check if exists
  const { data } = await supabase.from('profiles').select('id').eq('email', user.email).single()

  if (!data) {
    await supabase.from('profiles').insert({
      // We might want to use the existing ID if it is a UUID, but local IDs are like 'user-123...'
      // Supabase is UUID. We will let Supabase generate a new UUID and map it.
      // OR we can store the local ID in metadata.
      // For simplicity in this migration: We create a NEW profile. 
      // The user object in the session will update its ID to the UUID eventually.
      email: user.email,
      name: user.name,
      role: user.role,
      verified: user.verified,
      password_hash: passwordHash,
      preferences: user.preferences,
      stats: user.stats,
      created_at: user.createdAt instanceof Date ? user.createdAt.toISOString() : new Date().toISOString()
    })
    console.log("[Migration] User synced to Supabase:", user.email)
  }
}

function saveUserSession(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  }
}
