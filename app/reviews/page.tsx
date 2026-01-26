"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, ThumbsUp, Flag } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"

const mockReviews = [
  {
    id: "1",
    userName: "Ahmed Hassan",
    userAvatar: "AH",
    rating: 5,
    comment: "Excellent seller! Fast delivery and product exactly as described.",
    date: new Date("2024-12-20"),
    helpful: 12,
    adTitle: "iPhone 15 Pro Max",
  },
  {
    id: "2",
    userName: "Sarah Mohamed",
    userAvatar: "SM",
    rating: 4,
    comment: "Good service but could be faster. Overall satisfied with the purchase.",
    date: new Date("2024-12-18"),
    helpful: 8,
    adTitle: "Web Development Service",
  },
  {
    id: "3",
    userName: "Khaled Ali",
    userAvatar: "KA",
    rating: 5,
    comment: "Highly professional! Will definitely work with this seller again.",
    date: new Date("2024-12-15"),
    helpful: 15,
    adTitle: "Graphic Design Package",
  },
]

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<"received" | "given">("received")
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    router.push("/auth/login")
    return null
  }

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

      <div className="p-4 pb-20">
        {/* Rating Overview */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="text-4xl font-bold text-slate-900">4.8</span>
                  <span className="text-sm text-slate-500">out of 5</span>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= 4 ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-500">Based on 45 reviews</p>
              </div>
              <div className="text-right">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <Star className="w-10 h-10 text-white fill-white" />
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600 w-8">{rating}</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${rating === 5 ? 75 : rating === 4 ? 20 : 5}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-500 w-10">{rating === 5 ? 34 : rating === 4 ? 9 : 2}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
          {mockReviews.map((review) => (
            <Card key={review.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-emerald-700">{review.userAvatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-slate-900">{review.userName}</h3>
                      <span className="text-xs text-slate-400">{review.date.toLocaleDateString()}</span>
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

                <Badge variant="secondary" className="mb-2 text-xs">
                  {review.adTitle}
                </Badge>

                <p className="text-sm text-slate-700 mb-3">{review.comment}</p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-600">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Helpful ({review.helpful})
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-600">
                    <Flag className="w-3 h-3 mr-1" />
                    Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
