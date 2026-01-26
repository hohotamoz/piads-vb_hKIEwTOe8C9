"use client"

import React from "react"

import { useState, useRef } from "react"
import { ArrowLeft, Camera, MapPin, Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { uploadImage } from "@/lib/image-upload"
import { createAd, getUserAds } from "@/lib/database"
import { toast } from "sonner"
import { getUserAdLimit, getUserSubscription } from "@/lib/subscription-manager"

const categories = ["Electronics", "Services", "Fashion", "Home & Garden", "Vehicles", "Jobs", "Real Estate", "Sports"]

const regions = [
  "Dubai, UAE",
  "Cairo, Egypt",
  "Riyadh, KSA",
  "Kuwait City, Kuwait",
  "Doha, Qatar",
  "Manama, Bahrain",
  "Muscat, Oman",
  "Amman, Jordan",
]

export default function PostAdPage() {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    region: "",
    images: [] as string[],
  })

  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if adding these files would exceed the limit
    const remainingSlots = 6 - formData.images.length
    if (remainingSlots === 0) {
      toast.error("Maximum 6 images allowed")
      return
    }

    setIsUploading(true)
    const newImages: string[] = []
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    try {
      for (const file of filesToProcess) {
        try {
          // Validate file size before processing
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} is too large (max 5MB)`)
            continue
          }

          // Validate file type
          if (!file.type.startsWith('image/')) {
            toast.error(`${file.name} is not an image file`)
            continue
          }

          const result = await uploadImage(file)

          if (result.success && result.url) {
            newImages.push(result.url)
          } else {
            toast.error(result.error || `Failed to upload ${file.name}`)
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          toast.error(`Failed to upload ${file.name}`)
        }
      }

      if (newImages.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }))
        toast.success(`${newImages.length} image(s) uploaded successfully`)
      } else if (filesToProcess.length > 0) {
        toast.error("No images were uploaded successfully")
      }
    } catch (error) {
      console.error("Error in image upload process:", error)
      toast.error("Error uploading images. Please try again.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to post an ad")
      router.push("/auth/login")
      return
    }

    // Validation
    if (!formData.title || !formData.description || !formData.price || !formData.category || !formData.region) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.images.length === 0) {
      toast.error("Please upload at least one image")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[v0] Starting ad submission process...")

      // Check subscription limits from database
      console.log("[v0] Checking user ad limits...")
      const userAds = await getUserAds(user.id)
      const activeAds = userAds.filter(ad => ad.status === "active")
      const adLimit = getUserAdLimit(user.id)
      const subscription = getUserSubscription(user.id)

      console.log("[v0] User ad stats:", {
        totalAds: userAds.length,
        activeAds: activeAds.length,
        adLimit
      })

      // Check if user can post more ads
      if (adLimit !== -1 && activeAds.length >= adLimit) {
        toast.error(
          subscription
            ? `You've reached your ad limit (${adLimit} ads). Upgrade to post more ads!`
            : `You've reached your free limit (${adLimit} ads). Subscribe to post more!`,
          {
            duration: 5000,
            action: {
              label: "View Plans",
              onClick: () => router.push("/profile"),
            },
          }
        )
        setIsSubmitting(false)
        return
      }

      // Validate images
      console.log("[v0] Validating images:", formData.images.length)
      if (formData.images.length === 0) {
        throw new Error("No images uploaded")
      }

      // Validate price
      const priceValue = parseFloat(formData.price)
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error("Invalid price value")
      }

      console.log("[v0] Creating ad in database...")
      // Create ad in database
      const newAd = await createAd({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: priceValue,
        category: formData.category,
        region: formData.region,
        images: formData.images,
        status: "active",
      })

      console.log("[v0] Ad created successfully:", newAd.id)
      toast.success("Ad posted successfully!")

      // Redirect to the new ad
      setTimeout(() => {
        router.push(`/ad/${newAd.id}`)
      }, 1000)
    } catch (error: any) {
      console.error("[v0] Error posting ad:", error)

      // Provide more specific error messages
      let errorMessage = "Failed to post ad. Please try again."

      if (error?.message) {
        if (error.message.includes("not configured")) {
          errorMessage = "Database connection error. Please contact support."
        } else if (error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else if (error.message.includes("Invalid")) {
          errorMessage = error.message
        } else {
          errorMessage = error.message
        }
      }

      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-4 flex items-center space-x-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0 hover:bg-slate-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Post New Ad</h1>
              <p className="text-xs text-slate-500">Share your products & services</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 pb-20 max-w-3xl">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl">
            <CardTitle className="text-lg font-bold text-slate-900">Create Your Ad</CardTitle>
            <p className="text-sm text-slate-600">Fill in the details to post your ad on Pi Network</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Images */}
            <div>
              <Label className="text-sm font-bold text-slate-900 mb-2 block">
                Photos <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-slate-500 mb-3">Upload up to 6 photos (Max 5MB each)</p>

              <div className="grid grid-cols-3 gap-3 mb-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-xl border-2 border-slate-200"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full p-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {formData.images.length < 6 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center space-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                        <span className="text-xs text-slate-500">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                        <span className="text-xs text-slate-500 font-medium">Add Photo</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-bold text-slate-900">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., iPhone 15 Pro Max - 256GB"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-2 border-slate-300 rounded-xl h-11"
                maxLength={100}
              />
              <p className="text-xs text-slate-500 mt-1">{formData.title.length}/100 characters</p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-bold text-slate-900">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your item or service in detail..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-2 min-h-[120px] border-slate-300 rounded-xl"
                maxLength={1000}
              />
              <p className="text-xs text-slate-500 mt-1">{formData.description.length}/1000 characters</p>
            </div>

            {/* Category */}
            <div>
              <Label className="text-sm font-bold text-slate-900 mb-2 block">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
                <SelectTrigger className="border-slate-300 rounded-xl h-11">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price" className="text-sm font-bold text-slate-900">
                Price (π) <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-lg">π</span>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="pl-10 border-slate-300 rounded-xl h-11"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Region */}
            <div>
              <Label className="text-sm font-bold text-slate-900 mb-2 block">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.region} onValueChange={(value) => setFormData((prev) => ({ ...prev, region: value }))}>
                <SelectTrigger className="border-slate-300 rounded-xl h-11">
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="mt-8 space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title || !formData.description || !formData.price || !formData.category || !formData.region || formData.images.length === 0}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-14 shadow-lg rounded-2xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Post Ad for Free
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-slate-500 leading-relaxed">
                By posting, you agree to our{" "}
                <span className="text-emerald-600 font-medium">Terms of Service</span> and{" "}
                <span className="text-emerald-600 font-medium">Community Guidelines</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
