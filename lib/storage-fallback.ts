// Fallback storage DEPRECATED
// All operations now require Supabase connection. LocalStorage usage for data persistence is disabled.

interface StoredAd { id: string } // Minimal stub

export function createAdFallback(ad: any): any {
  // Use 'ad' in error message to satisfy linter if needed, or just throw
  console.error("CRITICAL: Disabled fallback storage. Ad not created.", ad)
  throw new Error("Local storage is disabled. Please connect to the internet.")
}

export function getAdsFallback(_filters?: any): any[] {
  console.warn("Attempted to read ads from disabled fallback storage.")
  return []
}

export function searchAdsFallback(_query: string): any[] {
  return []
}

export function getAdByIdFallback(_id: string): any {
  return null
}

export function getUserAdsFallback(_userId: string): any[] {
  return []
}

export function updateAdFallback(_id: string, _updates: any): any {
  return null
}

export function deleteAdFallback(_id: string): boolean {
  return false
}

export function incrementViewsFallback(_id: string): void {
  // No-op
}

export function isFallbackStorageActive(): boolean {
  return false
}

export function getStorageInfo(): { mode: string; adsCount: number } {
  return { mode: 'Disabled', adsCount: 0 }
}

// Reviews Fallback (Disabled)
export function createReviewFallback(_review: any): any {
  console.error("Local reviews disabled.")
  throw new Error("Local storage is disabled.")
}

export function getAdReviewsFallback(_adId: string): any[] {
  return []
}

// Messages Fallback (Disabled)
export function createMessageFallback(_message: any): any {
  console.error("Local messages disabled.")
  throw new Error("Local storage is disabled.")
}

export function getUserMessagesFallback(_userId: string): any[] {
  return []
}

export function getConversationFallback(_adId: string, _userId: string, _otherUserId: string): any[] {
  return []
}

export function markMessageAsReadFallback(_messageId: string): void { }

// Notifications Fallback (Disabled)
export function createNotificationFallback(_notif: any): any {
  return null
}

export function getUserNotificationsFallback(_userId: string): any[] {
  return []
}

export function markNotificationAsReadFallback(_id: string): void { }

export function markAllNotificationsAsReadFallback(_userId: string): void { }
