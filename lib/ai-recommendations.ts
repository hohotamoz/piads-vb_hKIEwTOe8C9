import type { Ad, User } from "./types"

export interface UserBehavior {
  viewedCategories: Record<string, number>
  viewedLocations: Record<string, number>
  searchHistory: string[]
  likedAds: string[]
  preferredPriceRange: { min: number; max: number }
}

export interface RecommendationScore {
  adId: string
  score: number
  reasons: string[]
}

export class AIRecommendationEngine {
  // Calculate category match score
  private calculateCategoryScore(ad: Ad, behavior: UserBehavior): number {
    const categoryViews = behavior.viewedCategories[ad.category] || 0
    const totalViews = Object.values(behavior.viewedCategories).reduce((a, b) => a + b, 0) || 1
    return (categoryViews / totalViews) * 100
  }

  // Calculate location proximity score
  private calculateLocationScore(ad: Ad, behavior: UserBehavior): number {
    const locationViews = behavior.viewedLocations[ad.location] || 0
    const totalViews = Object.values(behavior.viewedLocations).reduce((a, b) => a + b, 0) || 1
    return (locationViews / totalViews) * 100
  }

  // Calculate search relevance score
  private calculateSearchScore(ad: Ad, behavior: UserBehavior): number {
    if (behavior.searchHistory.length === 0) return 0

    const adText = `${ad.title} ${ad.description} ${ad.tags.join(" ")}`.toLowerCase()
    const matches = behavior.searchHistory.filter((query) => adText.includes(query.toLowerCase())).length

    return (matches / behavior.searchHistory.length) * 100
  }

  // Calculate price preference score
  private calculatePriceScore(ad: Ad, behavior: UserBehavior): number {
    const price = Number.parseFloat(ad.price.replace(/[^0-9.]/g, ""))
    const { min, max } = behavior.preferredPriceRange

    if (price >= min && price <= max) return 100
    if (price < min) return Math.max(0, 100 - ((min - price) / min) * 100)
    if (price > max) return Math.max(0, 100 - ((price - max) / max) * 100)

    return 50
  }

  // Calculate engagement score based on ad metrics
  private calculateEngagementScore(ad: Ad): number {
    const ratingScore = (ad.rating / 5) * 30
    const reviewScore = Math.min((ad.reviews / 100) * 20, 20)
    const viewScore = Math.min((ad.views / 1000) * 20, 20)
    const featuredBonus = ad.featured ? 15 : 0
    const promotedBonus = ad.promoted ? 15 : 0

    return ratingScore + reviewScore + viewScore + featuredBonus + promotedBonus
  }

  // Calculate recency score
  private calculateRecencyScore(ad: Ad): number {
    const now = new Date()
    const daysSinceCreated = Math.floor((now.getTime() - ad.createdAt.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceCreated <= 1) return 100
    if (daysSinceCreated <= 7) return 80
    if (daysSinceCreated <= 30) return 60
    if (daysSinceCreated <= 90) return 40
    return 20
  }

  // Main recommendation algorithm
  generateRecommendations(ads: Ad[], user: User | null, behavior: UserBehavior, limit = 10): RecommendationScore[] {
    const recommendations: RecommendationScore[] = []

    for (const ad of ads) {
      const reasons: string[] = []
      let totalScore = 0

      // Category preference (weight: 25%)
      const categoryScore = this.calculateCategoryScore(ad, behavior)
      if (categoryScore > 20) {
        totalScore += categoryScore * 0.25
        reasons.push("Matches your interests")
      }

      // Location preference (weight: 15%)
      const locationScore = this.calculateLocationScore(ad, behavior)
      if (locationScore > 20) {
        totalScore += locationScore * 0.15
        reasons.push("Near your preferred locations")
      }

      // Search relevance (weight: 20%)
      const searchScore = this.calculateSearchScore(ad, behavior)
      if (searchScore > 0) {
        totalScore += searchScore * 0.2
        reasons.push("Related to your searches")
      }

      // Price preference (weight: 10%)
      const priceScore = this.calculatePriceScore(ad, behavior)
      totalScore += priceScore * 0.1

      // Engagement metrics (weight: 20%)
      const engagementScore = this.calculateEngagementScore(ad)
      totalScore += engagementScore * 0.2
      if (ad.rating >= 4.5) {
        reasons.push("Highly rated")
      }

      // Recency (weight: 10%)
      const recencyScore = this.calculateRecencyScore(ad)
      totalScore += recencyScore * 0.1
      if (recencyScore >= 80) {
        reasons.push("Recently posted")
      }

      // Add premium boost for featured/promoted ads
      if (ad.featured || ad.promoted) {
        reasons.push("Featured ad")
      }

      recommendations.push({
        adId: ad.id,
        score: Math.round(totalScore),
        reasons: reasons.slice(0, 2), // Limit to top 2 reasons
      })
    }

    // Sort by score and return top results
    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  // Generate personalized recommendations for user
  getPersonalizedAds(ads: Ad[], user: User | null, behavior: UserBehavior, limit = 10): Ad[] {
    const recommendations = this.generateRecommendations(ads, user, behavior, limit)
    const adMap = new Map(ads.map((ad) => [ad.id, ad]))

    return recommendations.map((rec) => adMap.get(rec.adId)!).filter(Boolean)
  }

  // Get trending ads based on engagement
  getTrendingAds(ads: Ad[], limit = 10): Ad[] {
    return [...ads]
      .sort((a, b) => {
        const scoreA = this.calculateEngagementScore(a) + this.calculateRecencyScore(a)
        const scoreB = this.calculateEngagementScore(b) + this.calculateRecencyScore(b)
        return scoreB - scoreA
      })
      .slice(0, limit)
  }

  // Get similar ads based on category and tags
  getSimilarAds(targetAd: Ad, allAds: Ad[], limit = 5): Ad[] {
    return allAds
      .filter((ad) => ad.id !== targetAd.id)
      .map((ad) => {
        let similarity = 0

        // Category match
        if (ad.category === targetAd.category) similarity += 40

        // Tag overlap
        const commonTags = ad.tags.filter((tag) => targetAd.tags.includes(tag))
        similarity += (commonTags.length / Math.max(targetAd.tags.length, 1)) * 30

        // Location match
        if (ad.location === targetAd.location) similarity += 20

        // Price range similarity
        const priceA = Number.parseFloat(ad.price.replace(/[^0-9.]/g, ""))
        const priceB = Number.parseFloat(targetAd.price.replace(/[^0-9.]/g, ""))
        const priceDiff = Math.abs(priceA - priceB)
        const avgPrice = (priceA + priceB) / 2
        similarity += Math.max(0, 10 - (priceDiff / avgPrice) * 10)

        return { ad, similarity }
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((item) => item.ad)
  }
}

// Singleton instance
export const recommendationEngine = new AIRecommendationEngine()
