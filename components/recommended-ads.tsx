"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Sparkles } from "lucide-react"
import type { Ad } from "@/lib/types"
import { recommendationEngine } from "@/lib/ai-recommendations"
import { getUserBehavior } from "@/lib/user-behavior"
import { useAuth } from "./auth-provider"
import { mockAds } from "@/lib/mock-data"

export function RecommendedAds() {
  const [recommendedAds, setRecommendedAds] = useState<Ad[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const behavior = getUserBehavior()
    const recommendations = recommendationEngine.getPersonalizedAds(mockAds, user, behavior, 5)
    setRecommendedAds(recommendations)
  }, [user])

  if (recommendedAds.length === 0) return null

  return (
    <div className="px-4 py-4">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="w-5 h-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-slate-900">Recommended for You</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">Based on your interests and browsing behavior</p>

      <div className="space-y-3">
        {recommendedAds.map((ad) => (
          <Card key={ad.id} className="cursor-pointer hover:shadow-md transition-all border-slate-200 card-hover">
            <CardContent className="p-0">
              <div className="flex">
                <img
                  src={ad.images[0] || "/placeholder.svg"}
                  alt={ad.title}
                  className="w-24 h-24 object-cover rounded-l-lg"
                />
                <div className="flex-1 p-3">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-slate-900 text-sm leading-tight">{ad.title}</h3>
                    <Badge variant="secondary" className="text-xs ml-2 bg-emerald-50 text-emerald-700 border-0">
                      {ad.category}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-slate-600 font-medium">{ad.rating}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600">{ad.seller}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{ad.location}</span>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm">{ad.price} π</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
