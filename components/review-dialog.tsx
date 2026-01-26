"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { reviewsSystem } from "@/lib/reviews-system"

interface ReviewDialogProps {
  adId: string
  isOpen: boolean
  onClose: () => void
  userId: string
  userName: string
  userAvatar?: string
  onReviewAdded: () => void
}

export function ReviewDialog({
  adId,
  isOpen,
  onClose,
  userId,
  userName,
  userAvatar,
  onReviewAdded,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Please write a review comment")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await reviewsSystem.addReview(
        adId,
        userId,
        userName,
        userAvatar,
        rating,
        comment.trim(),
        true
      )

      if (result) {
        toast.success("Review posted successfully!")
        onReviewAdded()
        onClose()
        setRating(5)
        setComment("")
      } else {
        throw new Error("Failed to save review")
      }
    } catch (error: any) {
      console.error("Failed to post review:", error)
      // Show more specific error if available
      toast.error(error.message || "Failed to post review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this product or service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Your Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300"
                      }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-slate-600">
                {rating} {rating === 1 ? "star" : "stars"}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium text-slate-700">
              Your Review
            </label>
            <Textarea
              id="comment"
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none rounded-xl"
            />
            <p className="text-xs text-slate-500">
              {comment.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !comment.trim()}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Posting...
              </>
            ) : (
              "Post Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
