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

        // 3. Migrate Reviews
        await migrateReviews()

        // 4. Migrate Messages
        await migrateMessages()

        // 5. Mark as done
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
            const { error } = await supabase.from('profiles').insert({
                id: user.id, // Try to preserve UUID if valid UUID, else Supabase gen. But local IDs might be "user_123".
                // If local id is simple string, let Supabase gen new one? NO, we need mapping.
                // Actually, let's TRY to use same email to link.
                // Insert with email
                email: user.email,
                name: user.name,
                role: user.role === 'admin' ? 'admin' : 'user',
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
        // Resolve user
        const localUserEmail = findLocalUserEmail(ad.user_id)
        if (!localUserEmail) continue

        const { data: profile } = await supabase.from('profiles').select('id').eq('email', localUserEmail).single()

        if (profile) {
            // Check existence 
            const { count } = await supabase.from('ads').select('*', { count: 'exact', head: true }).eq('title', ad.title).eq('user_id', profile.id)
            if (count && count > 0) continue

            const newAd = {
                user_id: profile.id,
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
        }
    }
}

async function migrateReviews() {
    const revsJson = localStorage.getItem(STORAGE_KEYS.REVIEWS)
    if (!revsJson) return

    const reviews: any[] = JSON.parse(revsJson)
    console.log(`[Migration] Found ${reviews.length} local reviews.`)

    for (const rev of reviews) {
        // We need ad_id (which relies on migrated ads) and reviewer_id
        // This is tricky if IDs changed. 
        // Strategy: Match Ad by title? Or assume we kept Ad UUID if it was valid?
        // LocalStorage fallback likely generated simple IDs like "ad_170...".
        // Supabase generation creates UUIDs. 
        // Linkage is broken unless we have a Map of OldID -> NewID.
        // For now, let's assume we can find the ad by Title + User.

        // 1. Find the Ad
        // We need the owner of the ad from local storage to find it in DB?
        // Actually review object has adId. We need to find the old ad in local storage to get its title?
        // Yes.
        const oldAd = findLocalAd(rev.adId)
        if (!oldAd) continue

        const localOwnerEmail = findLocalUserEmail(oldAd.user_id)
        if (!localOwnerEmail) continue

        // Find Ad Owner Profile ID in Supabase
        const { data: ownerProfile } = await supabase.from('profiles').select('id').eq('email', localOwnerEmail).single()
        if (!ownerProfile) continue

        // Find the Ad in Supabase by Title + Owner
        const { data: newAd } = await supabase.from('ads').select('id').eq('title', oldAd.title).eq('user_id', ownerProfile.id).single()
        if (!newAd) continue

        // 2. Find the Reviewer
        const localReviewerEmail = findLocalUserEmail(rev.userId)
        if (!localReviewerEmail) continue

        const { data: reviewerProfile } = await supabase.from('profiles').select('id').eq('email', localReviewerEmail).single()
        if (!reviewerProfile) continue

        // 3. Insert Review
        const { error } = await supabase.from('reviews').insert({
            ad_id: newAd.id,
            reviewer_id: reviewerProfile.id,
            rating: rev.rating,
            comment: rev.comment,
            created_at: rev.createdAt
        })
        if (error) console.error("[Migration] Review insert failed", error)
    }
}

async function migrateMessages() {
    const msgsJson = localStorage.getItem(STORAGE_KEYS.MESSAGES)
    if (!msgsJson) return

    // Messages are stored as Map in JSON: { messages: { convId: [msg, msg] } } or flat array?
    // In `realtime-messages.ts` (old): localStorage.setItem("piads_messages", JSON.stringify({ messages: ..., conversations: ... }))

    // We need to parse that structure.
    try {
        const data = JSON.parse(msgsJson)
        const messagesMap = data.messages || {}
        const conversationsMap = data.conversations || {}

        // Conversations usually link Ad -> Participants.
        // We need to reconstruct.

        const allMessages = Object.values(messagesMap).flat() as any[]
        console.log(`[Migration] Found ${allMessages.length} messages.`)

        for (const msg of allMessages) {
            // Resolve Sender
            const senderEmail = findLocalUserEmail(msg.senderId)
            if (!senderEmail) continue
            const { data: sender } = await supabase.from('profiles').select('id').eq('email', senderEmail).single()
            if (!sender) continue

            // Resolve Receiver
            const receiverEmail = findLocalUserEmail(msg.receiverId)
            if (!receiverEmail) continue
            const { data: receiver } = await supabase.from('profiles').select('id').eq('email', receiverEmail).single()
            if (!receiver) continue

            // Resolve Ad
            // Message might not have adId directly, but conversation does.
            let adId = null
            const conv = conversationsMap[msg.conversationId]
            if (conv && conv.adId) {
                // Find new Ad ID
                const oldAd = findLocalAd(conv.adId)
                if (oldAd) {
                    const oldOwnerEmail = findLocalUserEmail(oldAd.user_id)
                    if (oldOwnerEmail) {
                        const { data: owner } = await supabase.from('profiles').select('id').eq('email', oldOwnerEmail).single()
                        if (owner) {
                            const { data: newAdObj } = await supabase.from('ads').select('id').eq('title', oldAd.title).eq('user_id', owner.id).single()
                            if (newAdObj) adId = newAdObj.id
                        }
                    }
                }
            }

            if (!adId) {
                // Try to guess ad from context or skip? 
                // If we can't link to an Ad, we can't insert into our schema which requires ad_id.
                // Maybe we can insert with null if allowed? Schema says `ad_id` is uuid not null usually?
                // Let's skip if no Ad found, or try harder.
                console.warn("Skipping message due to missing Ad link", msg.id)
                continue
            }

            // Insert Message
            await supabase.from('messages').insert({
                ad_id: adId,
                sender_id: sender.id,
                receiver_id: receiver.id,
                content: msg.text,
                is_read: msg.read,
                created_at: msg.timestamp
            })
        }

    } catch (e) {
        console.error("Failed to migrate messages", e)
    }
}

function findLocalUserEmail(localUserId: string): string | null {
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS)
    if (!usersJson) return null
    const users: User[] = JSON.parse(usersJson)
    const user = users.find(u => u.id === localUserId)
    return user ? user.email : null
}

function findLocalAd(localAdId: string): Ad | null {
    const adsJson = localStorage.getItem(STORAGE_KEYS.ADS)
    if (!adsJson) return null
    const ads: Ad[] = JSON.parse(adsJson)
    return ads.find(a => a.id === localAdId) || null
} 
