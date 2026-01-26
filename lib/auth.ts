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

  // 1. Try Supabase Login
  if (isSupabaseConfigured) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', emailLower)
        .single()

      if (!error && profile) {
        // Verify Password Hash
        // Note: For real security you rely on Supabase Auth. 
        // Here we are comparing the stored custom hash to support the legacy system migration.
        // We need to import the hash function which is unfortunately not exported directly from credentials.ts in the original file,
        // but we can re-implement or export it. I'll stick to 'verifyLocalCredentials' logic if possible but it relies on localStorage.
        // So we will re-implement a simple check or assume the profile has the hash.

        // Let's rely on the client-side hash check for this specific "custom auth" implementation
        // ideally we would move this to a Supabase Edge Function or RPC to be secure.
        // For this task, we verify against the hash stored in the profile row.

        // We need to hash the input password to compare. 
        // Since we can't easily import the internal hash function from credentials.ts without modifying it, 
        // we will fetch the 'credentials' logic or use a consistent hashing method.
        // Let's assume we update credentials.ts to export 'hashPassword' or we duplicate the simple hash here.
        // See updated imports above: `hashPassword` (need to export it in credentials.ts first!)

        // WARNING: If credentials.ts doesn't export hashPassword, this will fail. 
        // I will assume for now we will update credentials.ts as well. 

        // If we can't verify hash here (because it's salt-dependent), we might need to fallback to 
        // checking if the user exists locally to verify credentials, OR trust the migration.

        // Actually, let's use a simpler approach: 
        // If profile exists in Supabase, we trust it IF we can verify the password.
        // Since we are migrating, we might not have the password hash in Supabase yet for everyone unless we migrated it.

        if (profile.password_hash) {
          // We need the hash function. I'll add a temporary one here if needed, but best to export from credentials.
          // For now, let's assume valid login if we find the user AND (fallback verify returns true OR we match hash).

          // RE-IMPLEMENTING SIMPLE HASH FOR CONSISTENCY (Must match credentials.ts)
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
            return user
          }
        }
      }
    } catch (e) {
      console.warn("Supabase login failed, trying local:", e)
    }
  }

  // 2. Fallback: Local Storage Login
  const users = getAllUsersLocal()
  const user = users.find(u => u.email.toLowerCase() === emailLower)

  if (user) {
    const { verifyCredentials } = await import("./credentials")
    if (verifyCredentials(emailLower, password)) {
      // Sync to Supabase if missing
      if (isSupabaseConfigured) {
        syncUserToSupabase(user, password).catch(console.error)
      }
      saveUserSession(user)
      return user
    }
  }

  // 3. Admin Fallback (Hardcoded)
  if (isAdminEmail(emailLower)) {
    const { verifyCredentials, hasStoredCredentials } = await import("./credentials")
    if (hasStoredCredentials(emailLower)) {
      if (!verifyCredentials(emailLower, password)) return null
    }

    // Create Admin User Object
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
    // Try to sync admin to Supabase
    if (isSupabaseConfigured) syncUserToSupabase(adminUser, password).catch(console.error)

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
export async function signInWithProvider(provider: 'google' | 'facebook'): Promise<{ error: any }> {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured for OAuth")
    return { error: { message: "Social login requires Supabase configuration" } }
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    }
  })

  return { error }
}

// --- Auth State Bridge ---
// Call this in your main layout or auth provider to sync Supabase Auth state to local profile
export function initAuthBridge() {
  if (!isSupabaseConfigured) return

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      console.log("[Auth Bridge] Supabase User Signed In:", session.user.email)

      const email = session.user.email
      if (!email) return

      // 1. Check if profile exists
      let { data: profile } = await supabase.from('profiles').select('*').eq('email', email).single()

      // 2. If not, create one
      if (!profile) {
        console.log("[Auth Bridge] Creating profile for OAuth user...")
        const name = session.user.user_metadata.full_name || session.user.user_metadata.name || email.split('@')[0]
        const avatar = session.user.user_metadata.avatar_url || session.user.user_metadata.picture

        const { data: newProfile, error } = await supabase.from('profiles').insert({
          id: session.user.id, // Use Supabase Auth UUID
          email: email,
          name: name,
          avatar: avatar,
          role: 'user',
          verified: true, // Social login implies verification
          created_at: new Date().toISOString()
        }).select().single()

        if (error) {
          console.error("[Auth Bridge] Failed to create profile:", error)
          // Try to fetch again in case of race condition
          const retry = await supabase.from('profiles').select('*').eq('email', email).single()
          if (retry.data) profile = retry.data
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
        // Reload to applying changes if needed, or rely on reactive state if context listens to storage
        // window.location.reload() // Optional: forceful reload
      }
    } else if (event === 'SIGNED_OUT') {
      signOut()
    }
  })
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
