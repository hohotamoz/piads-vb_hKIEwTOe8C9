"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, ThumbsUp, Flag } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { reviewsSystem } from "@/lib/reviews-system"
import { Review } from "@/lib/types"

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<"received" | "given">("received")
  const { user } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const loadReviews = async () => {
      setIsLoading(true)
      try {
        let data = []
        if (activeTab === "received") {
          data = await reviewsSystem.getReceivedReviews(user.id)
        } else {
          data = await reviewsSystem.getUserReviews(user.id)
        }
        setReviews(data)
      } catch (error) {
        console.error("Failed to load reviews", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [user, activeTab, router])

  if (!user) return null

  // Calculate average rating for received reviews
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Reviews & Ratings</h1>
              <p className="text-sm text-slate-500">Manage your feedback</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-20 max-w-4xl">
        {/* Rating Overview - Only show for Received */}
        {activeTab === "received" && (
          <Card className="mb-6 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-baseline space-x-2 mb-1">
                    <span className="text-4xl font-bold text-slate-900">{averageRating}</span>
                    <span className="text-sm text-slate-500">out of 5</span>
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= Number(averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">Based on {reviews.length} reviews</p>
                </div>
                <div className="text-right">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <Star className="w-10 h-10 text-white fill-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant={activeTab === "received" ? "default" : "outline"}
            onClick={() => setActiveTab("received")}
            className={
              activeTab === "received"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                : "border-slate-200 bg-transparent"
            }
          >
            Received Reviews
          </Button>
          <Button
            variant={activeTab === "given" ? "default" : "outline"}
            onClick={() => setActiveTab("given")}
            className={
              activeTab === "given"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                : "border-slate-200 bg-transparent"
            }
          >
            Given Reviews
          </Button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No reviews yet</h3>
              <p className="text-slate-500">You haven't {activeTab === "received" ? "received" : "given"} any reviews yet.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-emerald-700">
                        {review.userName?.slice(0, 2).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-slate-900">{review.userName || "User"}</h3>
                        <span className="text-xs text-slate-400">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {review.adTitle && (
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {review.adTitle}
                    </Badge>
                  )}

                  <p className="text-sm text-slate-700 mb-3">{review.comment}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
