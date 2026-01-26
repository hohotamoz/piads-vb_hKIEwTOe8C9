import { supabase, isSupabaseConfigured } from './supabase'
import type { Database } from './supabase'
import {
  createAdFallback,
  getAdsFallback,
  getAdByIdFallback,
  getUserAdsFallback,
  updateAdFallback,
  deleteAdFallback,
  incrementViewsFallback,
  searchAdsFallback,
  createReviewFallback,
  getAdReviewsFallback,
  createMessageFallback,
  getUserMessagesFallback,
  getConversationFallback,
  markMessageAsReadFallback,
  createNotificationFallback,
  getUserNotificationsFallback,
  markNotificationAsReadFallback,
  markAllNotificationsAsReadFallback
} from './storage-fallback'

type Ad = Database['public']['Tables']['ads']['Row']
type AdInsert = Database['public']['Tables']['ads']['Insert']
type AdUpdate = Database['public']['Tables']['ads']['Update']

// Ads Operations
export async function createAd(ad: AdInsert) {
  try {
    console.log("[v0] Creating ad in database:", { title: ad.title, user_id: ad.user_id })

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      console.warn("[v0] Supabase not configured, using fallback storage")
      return createAdFallback({ ...ad, images: ad.images || [], status: ad.status || 'active' })
    }

    const { data, error } = await supabase
      .from('ads')
      .insert(ad)
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error, falling back to localStorage:", error)
      return createAdFallback({ ...ad, images: ad.images || [], status: ad.status || 'active' })
    }

    console.log("[v0] Ad created successfully in Supabase:", data?.id)
    return data
  } catch (error) {
    console.error("[v0] Error in createAd, using fallback:", error)
    return createAdFallback({ ...ad, images: ad.images || [], status: ad.status || 'active' })
  }
}

export async function getAds(filters?: {
  category?: string
  region?: string
  status?: string
  limit?: number
}) {
  try {
    console.log("[v0] getAds called with filters:", filters)

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      console.warn("[v0] Supabase not configured, using fallback storage")
      return getAdsFallback(filters)
    }

    let query = supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    if (filters?.region && filters.region !== 'all') {
      query = query.eq('region', filters.region)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    } else {
      query = query.eq('status', 'active')
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching ads, using fallback:", error)
      return getAdsFallback(filters)
    }

    console.log("[v0] Successfully fetched ads from Supabase:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("[v0] Unexpected error in getAds, using fallback:", error)
    return getAdsFallback(filters)
  }
}

export async function getAdById(id: string) {
  try {
    if (!isSupabaseConfigured) {
      console.warn("[v0] Supabase not configured, using fallback storage")
      return getAdByIdFallback(id)
    }

    const { data: adData, error } = await supabase
      .from('ads')
      .select('*, profiles:user_id(name, avatar)')
      .eq('id', id)
      .single()

    if (error) {
      console.error("[v0] Error fetching ad, using fallback:", error)
      return getAdByIdFallback(id)
    }

    // Map Supabase result to App Interface (camelCase & specific fields)
    if (adData) {
      // @ts-ignore - Supabase types join
      const sellerName = adData.profiles?.name || 'Unknown Seller'
      // @ts-ignore
      const sellerAvatar = adData.profiles?.avatar

      return {
        ...adData,
        seller: sellerName,
        userAvatar: sellerAvatar,
        location: adData.region, // Map region -> location
        createdAt: new Date(adData.created_at), // Map string -> Date
        updatedAt: new Date(adData.updated_at),
        featured: adData.is_promoted, // Map boolean fields
        promoted: adData.is_promoted,
        rating: 0, // Placeholder or fetch real rating
        reviews: 0, // Placeholder
        tags: [] // Placeholder
      }
    }

    return null
  } catch (error) {
    console.error("[v0] Unexpected error in getAdById, using fallback:", error)
    return getAdByIdFallback(id)
  }
}

export async function getUserAds(userId: string) {
  try {
    console.log("[v0] Getting user ads for:", userId)

    if (!isSupabaseConfigured) {
      console.warn("[v0] Supabase not configured, using fallback storage")
      return getUserAdsFallback(userId)
    }

    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("[v0] Error getting user ads, using fallback:", error)
      return getUserAdsFallback(userId)
    }

    console.log("[v0] User ads fetched from Supabase:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("[v0] Unexpected error in getUserAds, using fallback:", error)
    return getUserAdsFallback(userId)
  }
}

export async function updateAd(id: string, updates: AdUpdate) {
  try {
    if (!isSupabaseConfigured) {
      console.warn("[v0] Supabase not configured, using fallback storage")
      return updateAdFallback(id, updates)
    }

    const { data, error } = await supabase
      .from('ads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating ad, using fallback:", error)
      return updateAdFallback(id, updates as any)
    }

    return data
  } catch (error) {
    console.error("[v0] Unexpected error in updateAd, using fallback:", error)
    return updateAdFallback(id, updates as any)
  }
}

export async function deleteAd(id: string) {
  try {
    if (!isSupabaseConfigured) {
      console.warn("[v0] Supabase not configured, using fallback storage")
      deleteAdFallback(id)
      return
    }

    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("[v0] Error deleting ad, using fallback:", error)
      deleteAdFallback(id)
    }
  } catch (error) {
    console.error("[v0] Unexpected error in deleteAd, using fallback:", error)
    deleteAdFallback(id)
  }
}

export async function incrementAdViews(id: string) {
  try {
    if (!isSupabaseConfigured) {
      incrementViewsFallback(id)
      return
    }

    const { error } = await supabase.rpc('increment_ad_views', { ad_id: id })
    if (error) {
      console.error('[v0] Error incrementing views, using fallback:', error)
      incrementViewsFallback(id)
    }
  } catch (error) {
    console.error('[v0] Unexpected error incrementing views, using fallback:', error)
    incrementViewsFallback(id)
  }
}

export async function searchAds(query: string) {
  if (!isSupabaseConfigured) return searchAdsFallback ? searchAdsFallback(query) : []

  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('status', 'active')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Reviews Operations
export async function createReview(review: {
  ad_id: string
  reviewer_id: string
  rating: number
  comment: string
}) {
  try {
    if (!isSupabaseConfigured) {
      throw new Error("Database not configured")
    }
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (e) {
    console.error("Supabase review error", e)
    throw e // Propagate error instead of fallback
  }
}

export async function getAdReviews(adId: string) {
  try {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('ad_id', adId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (e) {
    console.error("Error fetching reviews", e)
    return []
  }
}

// Messages Operations
export async function createMessage(message: {
  ad_id: string
  sender_id: string
  receiver_id: string
  content: string
}) {
  try {
    if (!isSupabaseConfigured) throw new Error("Database not configured")
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (e) {
    console.error("Supabase message error", e)
    throw e
  }
}

export async function getUserMessages(userId: string) {
  try {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (e) {
    return []
  }
}

export async function getConversation(adId: string, userId: string, otherUserId: string) {
  try {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('ad_id', adId)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  } catch (e) {
    return []
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    if (!isSupabaseConfigured) return markMessageAsReadFallback(messageId)
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId)

    if (error) throw error
  } catch (e) {
    markMessageAsReadFallback(messageId)
  }
}

// Notifications Operations
export async function createNotification(notification: {
  user_id: string
  type: string
  title: string
  message: string
  link?: string
}) {
  try {
    if (!isSupabaseConfigured) return createNotificationFallback(notification)
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (e) {
    console.error("Supabase notification error, using fallback", e)
    return createNotificationFallback(notification)
  }
}

export async function getUserNotifications(userId: string) {
  try {
    if (!isSupabaseConfigured) return getUserNotificationsFallback(userId)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (e) {
    return getUserNotificationsFallback(userId)
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    if (!isSupabaseConfigured) return markNotificationAsReadFallback(notificationId)
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) throw error
  } catch (e) {
    markNotificationAsReadFallback(notificationId)
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    if (!isSupabaseConfigured) return markAllNotificationsAsReadFallback(userId)
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
  } catch (e) {
    markAllNotificationsAsReadFallback(userId)
  }
}
