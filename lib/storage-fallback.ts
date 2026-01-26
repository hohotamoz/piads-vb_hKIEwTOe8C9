// Fallback storage DEPRECATED
// All operations now require Supabase connection. LocalStorage usage for data persistence is disabled.

interface StoredAd { id: string } // Minimal stub

export function createAdFallback(ad: any): any {
  console.error("CRITICAL: Attempted to use disabled fallback storage for Ad creation.")
  throw new Error("Local storage is disabled. Please connect to the internet.")
}

export function getAdsFallback(filters?: any): any[] {
  console.warn("Attempted to read ads from disabled fallback storage.")
  return []
}

export function searchAdsFallback(query: string): any[] {
  return []
}

export function getAdByIdFallback(id: string): any {
  return null
}

export function getUserAdsFallback(userId: string): any[] {
  return []
}

export function updateAdFallback(id: string, updates: any): any {
  return null
}

export function deleteAdFallback(id: string): boolean {
  return false
}

export function incrementViewsFallback(id: string): void {
  // No-op
}

export function isFallbackStorageActive(): boolean {
  return false
}

export function getStorageInfo(): { mode: string; adsCount: number } {
  return { mode: 'Disabled', adsCount: 0 }
}

// Reviews Fallback (Disabled)
export function createReviewFallback(review: any): any {
  console.error("Local reviews disabled.")
  throw new Error("Local storage is disabled.")
}

export function getAdReviewsFallback(adId: string): any[] {
  return []
}

// Messages Fallback (Disabled)
export function createMessageFallback(message: any): any {
  console.error("Local messages disabled.")
  throw new Error("Local storage is disabled.")
}

export function getUserMessagesFallback(userId: string): any[] {
  return []
}

export function getConversationFallback(adId: string, userId: string, otherUserId: string): any[] {
  return []
}

export function markMessageAsReadFallback(messageId: string): void { }

// Notifications Fallback (Disabled)
export function createNotificationFallback(notif: any): any {
  return null
}

export function getUserNotificationsFallback(userId: string): any[] {
  return []
}

export function markNotificationAsReadFallback(id: string): void { }

export function markAllNotificationsAsReadFallback(userId: string): void { }
