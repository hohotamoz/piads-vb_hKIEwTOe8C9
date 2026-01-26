import type { UserBehavior } from "./ai-recommendations"

const BEHAVIOR_KEY = "piads_user_behavior"

export function getUserBehavior(): UserBehavior {
  if (typeof window === "undefined") {
    return getDefaultBehavior()
  }

  const stored = localStorage.getItem(BEHAVIOR_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return getDefaultBehavior()
    }
  }
  return getDefaultBehavior()
}

export function saveUserBehavior(behavior: UserBehavior): void {
  if (typeof window === "undefined") return
  localStorage.setItem(BEHAVIOR_KEY, JSON.stringify(behavior))
}

export function trackCategoryView(category: string): void {
  const behavior = getUserBehavior()
  behavior.viewedCategories[category] = (behavior.viewedCategories[category] || 0) + 1
  saveUserBehavior(behavior)
}

export function trackLocationView(location: string): void {
  const behavior = getUserBehavior()
  behavior.viewedLocations[location] = (behavior.viewedLocations[location] || 0) + 1
  saveUserBehavior(behavior)
}

export function trackSearch(query: string): void {
  const behavior = getUserBehavior()
  if (!behavior.searchHistory.includes(query)) {
    behavior.searchHistory.push(query)
    // Keep only last 20 searches
    if (behavior.searchHistory.length > 20) {
      behavior.searchHistory.shift()
    }
  }
  saveUserBehavior(behavior)
}

export function trackAdLike(adId: string): void {
  const behavior = getUserBehavior()
  if (!behavior.likedAds.includes(adId)) {
    behavior.likedAds.push(adId)
  }
  saveUserBehavior(behavior)
}

export function updatePricePreference(price: number): void {
  const behavior = getUserBehavior()
  const currentMin = behavior.preferredPriceRange.min
  const currentMax = behavior.preferredPriceRange.max

  // Adaptive price range based on views
  behavior.preferredPriceRange.min = Math.min(currentMin, price * 0.5)
  behavior.preferredPriceRange.max = Math.max(currentMax, price * 1.5)

  saveUserBehavior(behavior)
}

function getDefaultBehavior(): UserBehavior {
  return {
    viewedCategories: {},
    viewedLocations: {},
    searchHistory: [],
    likedAds: [],
    preferredPriceRange: { min: 0, max: 10000 },
  }
}
