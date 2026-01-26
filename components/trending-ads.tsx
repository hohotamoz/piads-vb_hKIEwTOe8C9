"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp } from "lucide-react"
import type { Ad } from "@/lib/types"
import { recommendationEngine } from "@/lib/ai-recommendations"
import { mockAds } from "@/lib/mock-data"

export function TrendingAds() {
  const [trendingAds, setTrendingAds] = useState<Ad[]>([])

  useEffect(() => {
    const trending = recommendationEngine.getTrendingAds(mockAds, 6)
    setTrendingAds(trending)
  }, [])

  return (
    <div className="px-4 py-4 bg-white border-b border-slate-100">
      <div className="flex items-center space-x-2 mb-3">
        <TrendingUp className="w-5 h-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-slate-900">Trending Now</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {trendingAds.map((ad) => (
          <Card key={ad.id} className="cursor-pointer hover:shadow-md transition-all border-slate-200 card-hover">
            <CardContent className="p-0">
              <img
                src={ad.images[0] || "/placeholder.svg"}
                alt={ad.title}
                className="w-full h-32 object-cover rounded-t-lg"
              />
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-slate-900 text-sm leading-tight line-clamp-1">{ad.title}</h3>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-slate-600 font-medium">{ad.rating}</span>
                  <Badge variant="secondary" className="text-xs ml-auto bg-slate-100 text-slate-700 border-0">
                    {ad.views} views
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 line-clamp-1">{ad.location}</span>
                  <span className="font-bold text-emerald-600 text-sm">{ad.price} π</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
