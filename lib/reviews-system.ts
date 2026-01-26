import type { Review } from "./types"

class ReviewsSystem {
  private reviews: Review[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    const stored = localStorage.getItem("piads_reviews")
    if (stored) {
      try {
        const data = JSON.parse(stored)
        this.reviews = data.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
        }))
      } catch (error) {
        console.error("Failed to load reviews:", error)
      }
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return
    localStorage.setItem("piads_reviews", JSON.stringify(this.reviews))
  }

  addReview(
    adId: string,
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    rating: number,
    comment: string,
    verified: boolean = true
  ): Review {
    // Validation
    if (!adId || !userId || !userName) {
      throw new Error("Missing required fields")
    }

    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5")
    }

    if (!comment || comment.trim().length < 3) {
      throw new Error("Comment must be at least 3 characters")
    }

    // Check if user already reviewed this ad
    if (this.hasUserReviewed(adId, userId)) {
      throw new Error("You have already reviewed this product")
    }

    const review: Review = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      adId,
      userId,
      userName,
      userAvatar,
      rating,
      comment,
      createdAt: new Date(),
      verified,
    }

    this.reviews.push(review)
    this.saveToStorage()
    return review
  }

  getAdReviews(adId: string): Review[] {
    return this.reviews
      .filter(r => r.adId === adId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getUserReviews(userId: string): Review[] {
    return this.reviews
      .filter(r => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getAdAverageRating(adId: string): { average: number; count: number } {
    const adReviews = this.getAdReviews(adId)
    if (adReviews.length === 0) {
      return { average: 0, count: 0 }
    }

    const sum = adReviews.reduce((acc, review) => acc + review.rating, 0)
    return {
      average: Number((sum / adReviews.length).toFixed(1)),
      count: adReviews.length,
    }
  }

  deleteReview(reviewId: string, userId: string): boolean {
    const reviewIndex = this.reviews.findIndex(r => r.id === reviewId && r.userId === userId)
    if (reviewIndex !== -1) {
      this.reviews.splice(reviewIndex, 1)
      this.saveToStorage()
      return true
    }
    return false
  }

  hasUserReviewed(adId: string, userId: string): boolean {
    return this.reviews.some(r => r.adId === adId && r.userId === userId)
  }
}

export const reviewsSystem = new ReviewsSystem()
