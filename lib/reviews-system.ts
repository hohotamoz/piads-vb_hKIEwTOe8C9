import type { Review } from "./types"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

class ReviewsSystem {
  private reviews: Review[] = []

  constructor() { }

  async addReview(
    adId: string,
    userId: string,
    userName: string,
    userAvatar: string | undefined,
    rating: number,
    comment: string,
    verified: boolean = true
  ): Promise<Review | null> {
    if (!isSupabaseConfigured) return null

    // Validation
    if (!adId || !userId) throw new Error("Missing required fields")
    if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5")

    try {
      // Check if already reviewed
      const existing = await this.hasUserReviewed(adId, userId)
      if (existing) throw new Error("You have already reviewed this product")

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          ad_id: adId,
          reviewer_id: userId,
          rating,
          comment
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        adId: data.ad_id,
        userId: data.reviewer_id,
        userName, // We might need to fetch this from profile if we want it fresh, but passing it is okay
        userAvatar,
        rating: data.rating,
        comment: data.comment,
        createdAt: new Date(data.created_at),
        verified
      }
    } catch (error) {
      console.error("Error adding review:", error)
      throw error
    }
  }

  async getAdReviews(adId: string): Promise<Review[]> {
    if (!isSupabaseConfigured) return []

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
            *,
            reviewer:profiles!reviewer_id(name, avatar, verified)
        `)
        .eq("ad_id", adId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return data.map((r: any) => ({
        id: r.id,
        adId: r.ad_id,
        userId: r.reviewer_id,
        userName: r.reviewer?.name || "Anonymous",
        userAvatar: r.reviewer?.avatar,
        rating: r.rating,
        comment: r.comment,
        createdAt: new Date(r.created_at),
        verified: r.reviewer?.verified ?? false,
      }))
    } catch (error) {
      console.error("Error fetching reviews:", error)
      return []
    }
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    if (!isSupabaseConfigured) return []
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("reviewer_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return data.map((r: any) => ({
        id: r.id,
        adId: r.ad_id,
        userId: r.reviewer_id,
        userName: "You",
        rating: r.rating,
        comment: r.comment,
        createdAt: new Date(r.created_at),
        verified: true
      }))
    } catch (e) {
      console.error(e)
      return []
    }
  }

  async getAdAverageRating(adId: string): Promise<{ average: number; count: number }> {
    if (!isSupabaseConfigured) return { average: 0, count: 0 }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("ad_id", adId)

      if (error) throw error

      if (!data || data.length === 0) return { average: 0, count: 0 }

      const sum = data.reduce((acc, r) => acc + r.rating, 0)
      return {
        average: Number((sum / data.length).toFixed(1)),
        count: data.length
      }
    } catch (e) {
      console.error(e)
      return { average: 0, count: 0 }
    }
  }

  async hasUserReviewed(adId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false
    const { count } = await supabase
      .from("reviews")
      .select("*", { count: 'exact', head: true })
      .eq("ad_id", adId)
      .eq("reviewer_id", userId)

    return (count || 0) > 0
  }
}

export const reviewsSystem = new ReviewsSystem()
