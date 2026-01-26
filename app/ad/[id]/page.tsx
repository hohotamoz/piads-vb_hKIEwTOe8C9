"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { PurchaseDialog } from "@/components/purchase-dialog"
import { ReviewDialog } from "@/components/review-dialog"
import { ImageGallery } from "@/components/image-gallery"
import {
  ArrowLeft,
  Star,
  MapPin,
  Eye,
  Share2,
  Heart,
  MessageSquare,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  Phone,
  ShoppingCart,
  Package,
} from "lucide-react"
import { getAdById, incrementAdViews, getAdReviews } from "@/lib/database"
import { realtimeMessaging } from "@/lib/realtime-messages"
import { toast } from "sonner"
import { Review } from "@/lib/types"
import { reviewsSystem } from "@/lib/reviews-system"

export default function AdDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [ad, setAd] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAdData()
  }, [params.id])

  // State for ratings
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 })

  const loadAdData = async () => {
    try {
      setIsLoading(true)
      const adId = params.id as string

      // Load ad data
      const foundAd = await getAdById(adId)
      setAd(foundAd)

      if (foundAd) {
        // Increment views
        await incrementAdViews(adId)

        // Load reviews
        const adReviews = await reviewsSystem.getAdReviews(adId)
        setReviews(adReviews)

        // Load average rating
        const stats = await reviewsSystem.getAdAverageRating(adId)
        setRatingStats(stats)
      }
    } catch (error) {
      console.error("Error loading ad:", error)
      toast.error("Failed to load ad details")
    } finally {
      setIsLoading(false)
    }
  }

  const loadReviews = async (adId: string) => {
    const adReviews = await getAdReviews(adId)
    setReviews(adReviews)
  }

  const handleContactSeller = () => {
    if (!user) {
      toast.error("Please login to contact the seller")
      router.push("/auth/login")
      return
    }

    if (!ad) return

    try {
      // Create or get existing conversation
      const conversation = realtimeMessaging.createConversation(
        [user.id, ad.user_id],
        ad.id,
        ad.title
      )

      // Store conversation ID for messages page to use
      if (typeof window !== "undefined") {
        sessionStorage.setItem("activeConversation", conversation.id)
      }

      // Navigate to messages page
      toast.success("Opening conversation...")
      router.push("/messages")
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast.error("Failed to start conversation. Please try again.")
    }
  }

  const handleCallSeller = () => {
    if (!user) {
      toast.error("Please login to call the seller")
      return
    }
    toast.info("Voice call feature coming soon!")
  }

  const handlePurchase = () => {
    if (!user) {
      toast.error("Please login to purchase")
      router.push("/auth/login")
      return
    }
    setIsPurchaseDialogOpen(true)
  }

  const handleAddReview = () => {
    if (!user) {
      toast.error("Please login to write a review")
      router.push("/auth/login")
      return
    }

    // Check if user has already reviewed
    const userReview = reviews.find(r => r.reviewer_id === user.id)
    if (userReview) {
      toast.info("You have already reviewed this product")
      return
    }

    setIsReviewDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-600" />
          </div>
          <p className="text-sm text-slate-600 font-medium">Loading ad...</p>
        </div>
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ad Not Found</h2>
            <p className="text-slate-600 mb-4">The advertisement you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/")} className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % ad.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length)
  }

  const { average: avgRating, count: reviewCount } = ratingStats

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-10 h-10 p-0 rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-900" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-900">Product Details</h1>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full hover:bg-slate-100">
              <Share2 className="w-5 h-5 text-slate-600" />
            </Button>
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full hover:bg-slate-100" onClick={() => setIsFavorite(!isFavorite)}>
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Image Gallery */}
        <div className="bg-white p-4 mb-4 shadow-sm md:rounded-b-xl">
          <ImageGallery images={ad.images} title={ad.title} />
          {ad.featured && (
            <Badge className="mt-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
              ⭐ Featured
            </Badge>
          )}
        </div>

        <div className="px-4 space-y-4">
          {/* Price and Title */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{ad.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{ad.location}</span>
                    <span>•</span>
                    <Eye className="w-4 h-4" />
                    <span>{ad.views} views</span>
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-emerald-600">{ad.price} π</span>
                {ad.stock && (
                  <Badge variant="secondary" className="text-xs">
                    {ad.stock} in stock
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 mb-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= avgRating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600 font-medium">
                  {avgRating > 0 ? avgRating.toFixed(1) : "No reviews"}
                </span>
                <span className="text-sm text-slate-400">({reviewCount})</span>
              </div>
              <Badge variant="outline" className="rounded-full">
                {ad.category}
              </Badge>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-emerald-500">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold">
                      {ad.seller.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-slate-900">{ad.seller}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>Verified Seller</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleContactSeller}
                  className="rounded-xl border-emerald-500 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCallSeller}
                  className="rounded-xl border-emerald-500 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-bold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{ad.description}</p>
              <Separator className="my-3" />
              <div className="flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Posted {ad.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  {ad.tags?.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Reviews ({reviewCount})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddReview}
                  className="rounded-xl bg-transparent"
                >
                  Write Review
                </Button>
              </div>

              {reviews.length === 0 ? (
                <p className="text-center text-slate-500 py-6">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white text-sm font-bold">
                            {review.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-slate-900 text-sm">{review.userName}</h4>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">{review.comment}</p>
                          <p className="text-xs text-slate-400">
                            {review.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <Button variant="ghost" className="w-full text-emerald-600">
                      View all {reviews.length} reviews
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-50">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            onClick={handleContactSeller}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-semibold bg-transparent"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Contact
          </Button>
          <Button
            onClick={handlePurchase}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Buy Now
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      {user && (
        <>
          <PurchaseDialog
            ad={ad}
            isOpen={isPurchaseDialogOpen}
            onClose={() => setIsPurchaseDialogOpen(false)}
            userId={user.id}
          />
          <ReviewDialog
            adId={ad.id}
            isOpen={isReviewDialogOpen}
            onClose={() => setIsReviewDialogOpen(false)}
            userId={user.id}
            userName={user.name}
            userAvatar={user.avatar}
            onReviewAdded={() => loadReviews(ad.id)}
          />
        </>
      )}
    </div>
  )
}
