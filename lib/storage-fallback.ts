// Fallback storage system using localStorage when Supabase is unavailable
// This ensures the app works even without database connection

interface StoredAd {
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
  created_at: string
  updated_at: string
}

const STORAGE_KEY = 'piads_fallback_ads'
const STORAGE_REVIEWS_KEY = 'piads_fallback_reviews'

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get all ads from localStorage
function getAllStoredAds(): StoredAd[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('[v0] Error reading from localStorage:', error)
    return []
  }
}

// Save ads to localStorage
function saveAdsToStorage(ads: StoredAd[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ads))
  } catch (error) {
    console.error('[v0] Error saving to localStorage:', error)
  }
}

// Fallback: Create ad in localStorage
export function createAdFallback(ad: Omit<StoredAd, 'id' | 'views' | 'favorites' | 'is_promoted' | 'created_at' | 'updated_at'>): StoredAd {
  console.log('[v0] Using fallback storage for ad creation')

  const newAd: StoredAd = {
    ...ad,
    id: generateId(),
    views: 0,
    favorites: 0,
    is_promoted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const allAds = getAllStoredAds()
  allAds.unshift(newAd)
  saveAdsToStorage(allAds)

  console.log('[v0] Ad saved to fallback storage:', newAd.id)
  return newAd
}

// Fallback: Get all ads from localStorage
export function getAdsFallback(filters?: {
  category?: string
  region?: string
  status?: string
  limit?: number
}): StoredAd[] {
  console.log('[v0] Using fallback storage to get ads')

  let ads = getAllStoredAds()

  // Apply filters
  if (filters?.status) {
    ads = ads.filter(ad => ad.status === filters.status)
  } else {
    ads = ads.filter(ad => ad.status === 'active')
  }

  if (filters?.category && filters.category !== 'all') {
    ads = ads.filter(ad => ad.category === filters.category)
  }

  if (filters?.region && filters.region !== 'all') {
    ads = ads.filter(ad => ad.region === filters.region)
  }

  if (filters?.limit) {
    ads = ads.slice(0, filters.limit)
  }

  console.log('[v0] Fallback storage returned', ads.length, 'ads')
  return ads
}

export function searchAdsFallback(query: string): StoredAd[] {
  const ads = getAllStoredAds()
  const lowerQuery = query.toLowerCase()
  return ads.filter(ad =>
    ad.status === 'active' &&
    (ad.title.toLowerCase().includes(lowerQuery) || ad.description.toLowerCase().includes(lowerQuery))
  )
}

// Fallback: Get ad by ID
export function getAdByIdFallback(id: string): StoredAd | null {
  console.log('[v0] Using fallback storage to get ad:', id)
  const ads = getAllStoredAds()
  return ads.find(ad => ad.id === id) || null
}

// Fallback: Get user ads
export function getUserAdsFallback(userId: string): StoredAd[] {
  console.log('[v0] Using fallback storage to get user ads')
  const ads = getAllStoredAds()
  return ads.filter(ad => ad.user_id === userId)
}

// Fallback: Update ad
export function updateAdFallback(id: string, updates: Partial<StoredAd>): StoredAd | null {
  console.log('[v0] Using fallback storage to update ad:', id)

  const ads = getAllStoredAds()
  const index = ads.findIndex(ad => ad.id === id)

  if (index === -1) return null

  ads[index] = {
    ...ads[index],
    ...updates,
    updated_at: new Date().toISOString(),
  }

  saveAdsToStorage(ads)
  return ads[index]
}

// Fallback: Delete ad
export function deleteAdFallback(id: string): boolean {
  console.log('[v0] Using fallback storage to delete ad:', id)

  const ads = getAllStoredAds()
  const filteredAds = ads.filter(ad => ad.id !== id)

  if (filteredAds.length === ads.length) return false

  saveAdsToStorage(filteredAds)
  return true
}

// Fallback: Increment views
export function incrementViewsFallback(id: string): void {
  console.log('[v0] Using fallback storage to increment views:', id)

  const ads = getAllStoredAds()
  const ad = ads.find(ad => ad.id === id)

  if (ad) {
    ad.views = (ad.views || 0) + 1
    saveAdsToStorage(ads)
  }
}

// Check if fallback storage is being used
export function isFallbackStorageActive(): boolean {
  if (typeof window === 'undefined') return false
  const ads = getAllStoredAds()
  return ads.length > 0
}

// Get storage info
export function getStorageInfo(): { mode: string; adsCount: number } {
  const ads = getAllStoredAds()
  return {
    mode: 'localStorage (Fallback)',
    adsCount: ads.length
  }
}

// Reviews Fallback
export function createReviewFallback(review: Omit<StoredReview, 'id' | 'created_at'>): StoredReview {
  console.log('[v0] Using fallback storage for review creation')
  const newReview: StoredReview = {
    ...review,
    id: generateId(),
    created_at: new Date().toISOString()
  }
  const reviews = getAllStoredReviews()
  reviews.unshift(newReview)
  saveReviewsToStorage(reviews)
  return newReview
}

export function getAdReviewsFallback(adId: string): StoredReview[] {
  return getAllStoredReviews().filter(r => r.ad_id === adId)
}

// Messages Fallback
export function createMessageFallback(message: Omit<StoredMessage, 'id' | 'created_at' | 'is_read'>): StoredMessage {
  const newMessage: StoredMessage = {
    ...message,
    id: generateId(),
    is_read: false,
    created_at: new Date().toISOString()
  }
  const messages = getAllStoredMessages()
  messages.push(newMessage)
  saveMessagesToStorage(messages)
  return newMessage
}

export function getUserMessagesFallback(userId: string): StoredMessage[] {
  return getAllStoredMessages().filter(m => m.sender_id === userId || m.receiver_id === userId)
}

export function getConversationFallback(adId: string, userId: string, otherUserId: string): StoredMessage[] {
  return getAllStoredMessages().filter(m =>
    m.ad_id === adId && (
      (m.sender_id === userId && m.receiver_id === otherUserId) ||
      (m.sender_id === otherUserId && m.receiver_id === userId)
    )
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function markMessageAsReadFallback(messageId: string): void {
  const messages = getAllStoredMessages()
  const msg = messages.find(m => m.id === messageId)
  if (msg) {
    msg.is_read = true
    saveMessagesToStorage(messages)
  }
}

// Notifications Fallback
export function createNotificationFallback(notif: Omit<StoredNotification, 'id' | 'created_at' | 'is_read'>): StoredNotification {
  const newNotif: StoredNotification = {
    ...notif,
    id: generateId(),
    is_read: false,
    created_at: new Date().toISOString()
  }
  const notifs = getAllStoredNotifications()
  notifs.unshift(newNotif)
  saveNotificationsToStorage(notifs)
  return newNotif
}

export function getUserNotificationsFallback(userId: string): StoredNotification[] {
  return getAllStoredNotifications().filter(n => n.user_id === userId)
}

export function markNotificationAsReadFallback(id: string): void {
  const notifs = getAllStoredNotifications()
  const n = notifs.find(x => x.id === id)
  if (n) {
    n.is_read = true
    saveNotificationsToStorage(notifs)
  }
}

export function markAllNotificationsAsReadFallback(userId: string): void {
  const notifs = getAllStoredNotifications()
  notifs.forEach(n => {
    if (n.user_id === userId) n.is_read = true
  })
  saveNotificationsToStorage(notifs)
}

// --- Internal Review/Msg/Notif Storage Helpers ---

interface StoredReview {
  id: string
  ad_id: string
  reviewer_id: string
  rating: number
  comment: string
  created_at: string
}

interface StoredMessage {
  id: string
  ad_id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface StoredNotification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  link?: string
  created_at: string
}

function getAllStoredReviews(): StoredReview[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_REVIEWS_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}
function saveReviewsToStorage(data: StoredReview[]) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(data))
}

const STORAGE_MESSAGES_KEY = 'piads_fallback_messages'
function getAllStoredMessages(): StoredMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_MESSAGES_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}
function saveMessagesToStorage(data: StoredMessage[]) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(data))
}

const STORAGE_NOTIFICATIONS_KEY = 'piads_fallback_notifications'
function getAllStoredNotifications(): StoredNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}
function saveNotificationsToStorage(data: StoredNotification[]) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(data))
}
