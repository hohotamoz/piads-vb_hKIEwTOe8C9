import type { Ad } from "./types"
import { autoBackup } from "./data-backup"

// Storage key for ads
const ADS_STORAGE_KEY = "piads_all_ads"

// Initialize storage - only creates empty array if nothing exists
export function initializeAdsStorage() {
  if (typeof window === "undefined") return

  const existingAds = localStorage.getItem(ADS_STORAGE_KEY)
  if (!existingAds) {
    // Start with empty array - real users will add their own ads
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify([]))
  }
}

// Get all ads
export function getAllAds(): Ad[] {
  if (typeof window === "undefined") return []
  
  initializeAdsStorage()
  const ads = localStorage.getItem(ADS_STORAGE_KEY)
  if (!ads) return []
  
  try {
    const parsedAds = JSON.parse(ads)
    // Convert date strings back to Date objects
    return parsedAds.map((ad: any) => ({
      ...ad,
      createdAt: new Date(ad.createdAt),
    }))
  } catch {
    return []
  }
}

// Get ad by ID
export function getAdById(id: string): Ad | null {
  const ads = getAllAds()
  return ads.find((ad) => ad.id === id) || null
}

// Create new ad
export function createAd(adData: Omit<Ad, "id" | "createdAt" | "views" | "rating" | "reviews">): Ad {
  try {
    console.log("[v0] Creating ad with data:", adData)
    
    if (typeof window === "undefined") {
      throw new Error("Cannot create ad on server side")
    }
    
    const ads = getAllAds()
    console.log("[v0] Current ads count:", ads.length)
    
    const newAd: Ad = {
      ...adData,
      id: `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      views: 0,
      rating: 0,
      reviews: 0,
    }
    
    ads.unshift(newAd)
    
    // Save to localStorage with error handling
    try {
      const adsJSON = JSON.stringify(ads)
      localStorage.setItem(ADS_STORAGE_KEY, adsJSON)
      console.log("[v0] Ad saved successfully, new count:", ads.length)
    } catch (storageError) {
      console.error("[v0] localStorage error:", storageError)
      throw new Error("Storage quota exceeded. Please delete some old ads.")
    }
    
    // Optional backup (don't fail if backup fails)
    try {
      autoBackup()
    } catch (backupError) {
      console.warn("[v0] Backup failed but ad was saved:", backupError)
    }
    
    return newAd
  } catch (error) {
    console.error("[v0] Error in createAd:", error)
    throw error instanceof Error ? error : new Error("Failed to create ad")
  }
}

// Update ad
export function updateAd(id: string, updates: Partial<Ad>): Ad | null {
  const ads = getAllAds()
  const index = ads.findIndex((ad) => ad.id === id)
  
  if (index === -1) return null
  
  ads[index] = { ...ads[index], ...updates }
  
  try {
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(ads))
    
    // Optional backup
    try {
      autoBackup()
    } catch (e) {
      console.warn("[v0] Backup failed but update was saved")
    }
  } catch (error) {
    console.error("[v0] Failed to update ad:", error)
    return null
  }
  
  return ads[index]
}

// Delete ad
export function deleteAd(id: string): boolean {
  const ads = getAllAds()
  const filteredAds = ads.filter((ad) => ad.id !== id)
  
  if (filteredAds.length === ads.length) return false
  
  try {
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(filteredAds))
    
    // Optional backup
    try {
      autoBackup()
    } catch (e) {
      console.warn("[v0] Backup failed but delete was successful")
    }
    
    return true
  } catch (error) {
    console.error("[v0] Failed to delete ad:", error)
    return false
  }
}

// Get user's ads
export function getUserAds(userId: string): Ad[] {
  const ads = getAllAds()
  return ads.filter((ad) => ad.userId === userId)
}

// Search ads
export function searchAds(query: string): Ad[] {
  const ads = getAllAds()
  const lowerQuery = query.toLowerCase()
  
  return ads.filter(
    (ad) =>
      ad.title.toLowerCase().includes(lowerQuery) ||
      ad.description.toLowerCase().includes(lowerQuery) ||
      ad.category.toLowerCase().includes(lowerQuery) ||
      ad.location.toLowerCase().includes(lowerQuery) ||
      ad.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

// Get ads by category
export function getAdsByCategory(category: string): Ad[] {
  const ads = getAllAds()
  return ads.filter((ad) => ad.category === category)
}

// Get featured ads
export function getFeaturedAds(): Ad[] {
  const ads = getAllAds()
  return ads.filter((ad) => ad.featured && ad.status === "active")
}

// Get promoted ads
export function getPromotedAds(): Ad[] {
  const ads = getAllAds()
  return ads.filter((ad) => ad.promoted && ad.status === "active")
}

// Increment views
export function incrementViews(id: string): void {
  const ad = getAdById(id)
  if (ad) {
    updateAd(id, { views: (ad.views || 0) + 1 })
  }
}

// Update ad status
export function updateAdStatus(id: string, status: "active" | "paused" | "sold"): Ad | null {
  return updateAd(id, { status })
}
