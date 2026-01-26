import { supabase, isSupabaseConfigured } from './supabase'
import { v4 as uuidv4 } from 'uuid'

// Storage keys
const STORAGE_KEYS = {
    ADS: 'piads_fallback_ads',
    REVIEWS: 'piads_fallback_reviews',
    MESSAGES: 'piads_fallback_messages',
    NOTIFICATIONS: 'piads_fallback_notifications',
    USERS: 'piads_users',
    MIGRATION_FLAG: 'piads_migration_done'
}

/* eslint-disable @typescript-eslint/no-explicit-any */

interface User {
    id: string
    email: string
    name: string
    role: string
    verified: boolean
    preferences?: any
    stats?: any
}

interface Ad {
    id: string
    user_id: string
    title: string
    description: string
    price: number
    category: string
    region: string
    images: string[]
    status: string
    views: number
    favorites: number
    is_promoted: boolean
    promotion_expires_at?: string
    created_at: string
    updated_at: string
}

export async function migrateLocalDataToSupabase(): Promise<void> {
    if (typeof window === 'undefined') return
    if (!isSupabaseConfigured) return

    // Check if already migrated
    if (localStorage.getItem(STORAGE_KEYS.MIGRATION_FLAG)) {
        console.log("[Migration] Already completed.")
        return
    }

    console.log("[Migration] Starting data migration to Supabase...")

    try {
        // 1. Migrate Users (Profiles) first to satisfy foreign keys
        await migrateUsers()

        // 2. Migrate Ads
        await migrateAds()

        // 3. Mark as done
        localStorage.setItem(STORAGE_KEYS.MIGRATION_FLAG, 'true')
        console.log("[Migration] Completed successfully.")
    } catch (error) {
        console.error("[Migration] Failed:", error)
    }
}

async function migrateUsers() {
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS)
    if (!usersJson) return

    const users: User[] = JSON.parse(usersJson)
    console.log(`[Migration] Found ${users.length} local users.`)

    for (const user of users) {
        // Check if exists
        const { data } = await supabase.from('profiles').select('id').eq('email', user.email).single()

        if (!data) {
            // Map local user to Supabase Profile
            // Note: We don't have password here, so we set a dummy or try to skip. 
            // Auth migration logic in auth.ts handles the password sync on login.
            // Here we just ensure the profile row exists so FKs don't fail for ads.

            const { error } = await supabase.from('profiles').insert({
                email: user.email,
                name: user.name,
                role: user.role === 'admin' ? 'admin' : 'user', // sanitization
                verified: user.verified,
                preferences: user.preferences || {},
                stats: user.stats || {}
            })

            if (error) console.error(`[Migration] Failed to migrate user ${user.email}:`, error)
        }
    }
}

async function migrateAds() {
    const adsJson = localStorage.getItem(STORAGE_KEYS.ADS)
    if (!adsJson) return

    const ads: Ad[] = JSON.parse(adsJson)
    console.log(`[Migration] Found ${ads.length} local ads.`)

    for (const ad of ads) {
        // We need to resolve the user_id (local ID) to a Supabase UUID
        // 1. Find the user email for this local user_id
        const localUserEmail = findLocalUserEmail(ad.user_id)
        if (!localUserEmail) {
            console.warn(`[Migration] Skipping ad ${ad.title} - Unknown local user ${ad.user_id}`)
            continue
        }

        // 2. Find the Supabase UUID for that email
        const { data: profile } = await supabase.from('profiles').select('id').eq('email', localUserEmail).single()

        if (profile) {
            // Check if ad exists (by duplicate check on title + user? or just blind insert?)
            // We'll blind insert but maybe generate a new UUID for the ID

            const newAd = {
                user_id: profile.id, // mapped UUID
                title: ad.title,
                description: ad.description,
                price: ad.price,
                category: ad.category,
                region: ad.region,
                images: ad.images,
                status: ad.status,
                views: ad.views,
                favorites: ad.favorites,
                is_promoted: ad.is_promoted,
                created_at: ad.created_at
            }

            const { error } = await supabase.from('ads').insert(newAd)
            if (error) console.error(`[Migration] Failed to migrate ad ${ad.title}:`, error)
        } else {
            console.warn(`[Migration] Skipping ad ${ad.title} - Cloud profile not found for ${localUserEmail}`)
        }
    }
}

function findLocalUserEmail(localUserId: string): string | null {
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS)
    if (!usersJson) return null
    const users: User[] = JSON.parse(usersJson)
    const user = users.find(u => u.id === localUserId)
    return user ? user.email : null
}
