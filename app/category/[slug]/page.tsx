"use client"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, SlidersHorizontal, Star, MapPin, TrendingUp, Smartphone, Wrench, Shirt, MouseIcon as HouseIcon, Car, Briefcase } from "lucide-react"
import Link from "next/link"
import { getAds } from "@/lib/database"

const categoryIcons = {
  electronics: Smartphone,
  services: Wrench,
  fashion: Shirt,
  "home & garden": HouseIcon,
  "home-garden": HouseIcon,
  vehicles: Car,
  jobs: Briefcase,
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categorySlug = params.slug as string
  const categoryName = categorySlug.replace(/-/g, " ")

  const [categoryAds, setCategoryAds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCategoryAds()
  }, [categoryName])

  const loadCategoryAds = async () => {
    try {
      setIsLoading(true)
      const allAds = await getAds({ status: 'active' })
      const filtered = allAds.filter((ad) => {
        const adCategory = ad.category.toLowerCase().trim()
        const targetCategory = categoryName.toLowerCase().trim()
        return adCategory === targetCategory
      })
      setCategoryAds(filtered)
    } catch (error) {
      console.error("Error loading category ads:", error)
      setCategoryAds([])
    } finally {
      setIsLoading(false)
    }
  }

  const IconComponent = categoryIcons[categoryName.toLowerCase() as keyof typeof categoryIcons] || Smartphone

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-emerald-600" />
          </div>
          <p className="text-sm text-slate-600">Loading {categoryName}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-9 h-9 p-0">
              <ArrowLeft className="w-5 h-5 text-slate-900" />
            </Button>
            <h1 className="text-lg font-semibold text-slate-900 capitalize">{categoryName}</h1>
            <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
            </Button>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <IconComponent className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 capitalize">{categoryName}</h2>
              <p className="text-sm text-slate-600">{categoryAds.length} ads available</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 mt-4">
        {categoryAds.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <IconComponent className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No ads yet</h3>
              <p className="text-sm text-slate-600 mb-4">Be the first to post in this category!</p>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                onClick={() => router.push("/post")}
              >
                Post an Ad
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categoryAds.map((ad) => (
              <Link key={ad.id} href={`/ad/${ad.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-all border-slate-200 overflow-hidden h-full flex flex-col">
                  <div className="relative pt-[75%]">
                    <img
                      src={ad.images[0] || "/placeholder.svg"}
                      alt={ad.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {ad.is_promoted && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white text-xs px-2">
                        <Star className="w-2.5 h-2.5 mr-0.5" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2 mb-1 flex-1">
                      {ad.title}
                    </h3>

                    <div className="flex items-center justify-between mt-auto mb-2">
                      <span className="font-bold text-emerald-600 text-sm">{ad.price} π</span>
                      {ad.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-slate-600 font-medium">{ad.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 min-w-0 text-xs text-slate-500">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{ad.region}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
