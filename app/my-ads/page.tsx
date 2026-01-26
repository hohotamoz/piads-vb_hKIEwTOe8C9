"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Star, MapPin, Eye, Edit, Trash2, TrendingUp, PauseCircle, PlayCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getUserAds, deleteAd, updateAd } from "@/lib/database"
import { toast } from "sonner"
import { Ad } from "@/types" // Import Ad type
import { getAllAds, updateAdStatus } from "@/lib/ad-utils" // Import getAllAds and updateAdStatus functions

export default function MyAdsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("active")
  const [userAds, setUserAds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    if (user) {
      loadUserAds()
    }
  }, [user])

  const loadUserAds = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const ads = await getUserAds(user.id)
      setUserAds(ads)
    } catch (error) {
      console.error("Error loading ads:", error)
      toast.error("Failed to load your ads")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

  const activeAds = userAds.filter((ad) => ad.status === "active")
  const pausedAds = userAds.filter((ad) => ad.status === "pending") // Using pending as paused
  const soldAds = userAds.filter((ad) => ad.status === "sold")

  const getAdsForTab = () => {
    switch (activeTab) {
      case "active":
        return activeAds
      case "paused":
        return pausedAds
      case "sold":
        return soldAds
      default:
        return activeAds
    }
  }

  const currentAds = getAdsForTab()

  const handlePauseAd = async (adId: string) => {
    try {
      await updateAd(adId, { status: "pending" }) // Using pending as paused
      await loadUserAds()
      toast.success("Ad paused successfully")
    } catch (error) {
      console.error("Error pausing ad:", error)
      toast.error("Failed to pause ad")
    }
  }

  const handleActivateAd = async (adId: string) => {
    try {
      await updateAd(adId, { status: "active" })
      await loadUserAds()
      toast.success("Ad activated successfully")
    } catch (error) {
      console.error("Error activating ad:", error)
      toast.error("Failed to activate ad")
    }
  }

  const handleDeleteAd = async (adId: string) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      try {
        await deleteAd(adId)
        await loadUserAds()
        toast.success("Ad deleted successfully")
      } catch (error) {
        console.error("Error deleting ad:", error)
        toast.error("Failed to delete ad")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">My Ads</h1>
                <p className="text-sm text-slate-500">{userAds.length} total ads</p>
              </div>
            </div>
            <Link href="/post">
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Ad
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{activeAds.length}</p>
              <p className="text-xs text-slate-500">Active</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{pausedAds.length}</p>
              <p className="text-xs text-slate-500">Paused</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{soldAds.length}</p>
              <p className="text-xs text-slate-500">Sold</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3 mt-0">
            {currentAds.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PlayCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No {activeTab} ads</h3>
                  <p className="text-sm text-slate-600 mb-4">Start posting to reach Pi Network users!</p>
                  <Link href="/post">
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Post Your First Ad
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              currentAds.map((ad) => (
                <Card key={ad.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-0">
                    <Link href={`/ad/${ad.id}`}>
                      <div className="flex cursor-pointer">
                        <img
                          src={ad.images[0] || "/placeholder.svg"}
                          alt={ad.title}
                          className="w-24 h-24 object-cover rounded-l-lg"
                        />
                        <div className="flex-1 p-3">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-medium text-slate-900 text-sm leading-tight flex-1">{ad.title}</h3>
                            {ad.featured && (
                              <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 mb-2">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-slate-600 font-medium">{ad.rating}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-600">{ad.views}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-600 text-sm">{ad.price} π</span>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-500">{ad.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="border-t border-slate-100 p-2 flex space-x-2">
                      <Link href={`/post?edit=${ad.id}`} className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full text-xs">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      {activeTab === "active" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={(e) => {
                            e.preventDefault()
                            handlePauseAd(ad.id)
                          }}
                        >
                          <PauseCircle className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      )}
                      {activeTab === "paused" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={(e) => {
                            e.preventDefault()
                            handleActivateAd(ad.id)
                          }}
                        >
                          <PlayCircle className="w-3 h-3 mr-1" />
                          Activate
                        </Button>
                      )}
                      <Link href="/promote" className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Promote
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.preventDefault()
                          handleDeleteAd(ad.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
