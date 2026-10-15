import { createHash, randomBytes } from "node:crypto"
import { supabaseAdmin } from "@/lib/supabase-admin"

export interface PiProfile {
  id: string
  pi_uid: string
  username: string
  name: string | null
  email: string
  role: string
  avatar?: string | null
  verified?: boolean
  stats?: Record<string, unknown> | null
  created_at?: string
}

/**
 * Pi is the only user-facing identity provider. Supabase Auth is used only as
 * the database's UUID identity because the existing app tables reference
 * profiles.id -> auth.users.id. Users never enter a Supabase password.
 */
export async function ensurePiProfile(piUid: string, username: string): Promise<PiProfile> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Pi login needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY configured on the server.")
  }
  if (!piUid || !username) throw new Error("Pi did not return a verified UID and username.")

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("profiles")
    .select("id, pi_uid, username, name, email, role, avatar, verified, stats, created_at")
    .eq("pi_uid", piUid)
    .maybeSingle()

  if (lookupError) throw new Error(`Could not look up Pi profile: ${lookupError.message}`)

  if (existing) {
    const { data: updated, error } = await supabaseAdmin
      .from("profiles")
      .update({ username, name: username, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select("id, pi_uid, username, name, email, role, avatar, verified, stats, created_at")
      .single()
    if (error) throw new Error(`Could not update Pi profile: ${error.message}`)
    return updated as PiProfile
  }

  // A deterministic private placeholder email is required by the existing
  // Supabase Auth schema; it is not a real email and is never shown as contact info.
  const emailHash = createHash("sha256").update(piUid).digest("hex").slice(0, 32)
  const internalEmail = `pi-${emailHash}@users.piads.invalid`
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: internalEmail,
    password: randomBytes(48).toString("base64url"),
    email_confirm: true,
    user_metadata: { full_name: username, username, pi_uid: piUid, auth_provider: "pi_network" },
  })

  let profileId = created.user?.id
  if (createError || !profileId) {
    // A previous attempt may have created auth.users before profile creation failed.
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", internalEmail)
      .maybeSingle()
    if (!existingProfile?.id) {
      throw new Error(`Could not create the Pi account: ${createError?.message || "Supabase did not return a user"}`)
    }
    profileId = existingProfile.id
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: profileId,
      email: internalEmail,
      pi_uid: piUid,
      username,
      name: username,
      role: "user",
      verified: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" })
    .select("id, pi_uid, username, name, email, role, avatar, verified, stats, created_at")
    .single()

  if (profileError || !profile) {
    throw new Error(`Pi identity was verified, but the app profile could not be saved: ${profileError?.message || "no profile returned"}`)
  }

  return profile as PiProfile
}
