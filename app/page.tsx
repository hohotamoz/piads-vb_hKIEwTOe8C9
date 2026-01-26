"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MapPin, Grid3X3, TrendingUp, Star, Bell, UserIcon, Smartphone, Wrench, Shirt, MouseIcon as HouseIcon, Car, Briefcase, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getAds } from "@/lib/database"
import { trackSearch } from "@/lib/user-behavior"
import { getUnreadCount } from "@/lib/notifications"
import { AuthSuccessHandler } from "@/components/auth-success-handler"
import { realtimeMessaging } from "@/lib/realtime-messages"
import { initializeAdsStorage, getAllAds } from "@/lib/ads-storage"

type Ad = {
  id: string
  title: string
  description: string
  price: number
  category: string
  region: string
  images: string[]
  status: string
  views: number
  favorites: number
  is_promoted: boolean
  rating?: number
  location?: string
  promoted?: boolean
  featured?: boolean
}

const categoryConfig = [
  { id: 1, name: "Electronics", nameAr: "إلكترونيات", Icon: Smartphone, slug: "electronics" },
  { id: 2, name: "Services", nameAr: "خدمات", Icon: Wrench, slug: "services" },
  { id: 3, name: "Fashion", nameAr: "أزياء", Icon: Shirt, slug: "fashion" },
  { id: 4, name: "Home & Garden", nameAr: "منزل وحديقة", Icon: HouseIcon, slug: "home-garden" },
  { id: 5, name: "Vehicles", nameAr: "مركبات", Icon: Car, slug: "vehicles" },
  { id: 6, name: "Jobs", nameAr: "وظائف", Icon: Briefcase, slug: "jobs" },
]

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const { user, isLoading: authLoading } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [ads, setAds] = useState<Ad[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    loadAds()
  }, [])

  const loadAds = async () => {
    try {
      console.log("[v0] Starting to load ads from database...")
      const allAds = await getAds({ status: 'active' })
      console.log("[v0] Loaded ads from database:", allAds?.length || 0)

      if (!allAds || allAds.length === 0) {
        console.log("[v0] No ads found in database, setting empty array")
        setAds([])
        setIsPageLoading(false)
        return
      }

      const mappedAds = allAds.map(ad => ({
        ...ad,
        location: ad.region,
        promoted: ad.is_promoted,
        featured: ad.is_promoted,
        rating: 4.5,
      }))
      console.log("[v0] Mapped ads successfully:", mappedAds.length)
      setAds(mappedAds)
    } catch (error) {
      console.error("[v0] Error loading ads:", error)
      setAds([])
    } finally {
      setIsPageLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      const conversations = realtimeMessaging.getConversations(user.id)
      const count = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
      setUnreadCount(count)
    }
  }, [user])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackSearch(searchQuery)
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const filteredAds = ads.filter((ad) => {
    if (selectedRegion === "all") return ad.status === "active"
    return ad.location === selectedRegion && ad.status === "active"
  })

  const featuredAds = ads.filter((ad) => ad.featured && ad.status === "active").slice(0, 6)

  const getCategoryCount = (categoryName: string) => {
    return ads.filter((ad) => {
      const adCategory = ad.category.toLowerCase().trim()
      const targetCategory = categoryName.toLowerCase().trim()
      return adCategory === targetCategory && ad.status === "active"
    }).length
  }

  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
          </div>
          <p className="text-sm text-primary font-medium">Loading PiAds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AuthSuccessHandler />

      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-[#312E81] sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-foreground text-lg font-bold">π</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PiAds</h1>
                <p className="text-xs text-white/60">Pi Network Marketplace</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-white hover:text-amber-400 font-medium transition-colors">Home</Link>
              <Link href="/search" className="text-white hover:text-amber-400 font-medium transition-colors">Search</Link>
              <Link href="/messages" className="text-white hover:text-amber-400 font-medium transition-colors">Messages</Link>
              <Link href="/post">
                <Button size="sm" className="bg-amber-400 hover:bg-amber-500 text-foreground font-bold rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Ad
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <Link href={user ? "/profile" : "/auth/login"} className="hidden md:flex">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <UserIcon className="w-5 h-5 mr-2" />
                  {user ? "Profile" : "Login"}
                </Button>
              </Link>

              <Link href="/notifications">
                <Button variant="ghost" size="sm" className="relative w-10 h-10 p-0 hover:bg-white/10 rounded-full">
                  <Bell className="w-5 h-5 text-white" />
                  {user && getUnreadCount(user.id) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {getUnreadCount(user.id)}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for products, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 pr-4 py-2.5 w-full border-0 rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 space-y-8 min-h-[calc(100vh-200px)]">
        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center">
              <Grid3X3 className="w-5 h-5 mr-2 text-primary" />
              Categories
            </h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categoryConfig.map((category) => {
              const count = getCategoryCount(category.name)
              return (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card className="hover:shadow-lg transition-all hover:scale-105 border shadow-sm bg-card h-full">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <category.Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{category.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{count} ads</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Featured Ads */}
        {featuredAds.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center">
                <Star className="w-5 h-5 mr-2 text-amber-500 fill-amber-500" />
                Featured Ads
              </h2>
              <Link href="/search?featured=true">
                <Button variant="ghost" size="sm" className="text-primary font-medium hover:text-amber-500">
                  See All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featuredAds.map((ad) => (
                <Link key={ad.id} href={`/ad/${ad.id}`}>
                  <Card className="hover:shadow-lg transition-all hover:scale-[1.02] border overflow-hidden bg-card shadow-sm h-full flex flex-col">
                    <div className="relative pt-[75%]">
                      <img
                        src={ad.images[0] || "/placeholder.svg"}
                        alt={ad.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {ad.promoted && (
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-amber-500 border-0 text-foreground font-bold">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Promoted
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3 flex-1 flex flex-col">
                      <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1 flex-1">{ad.title}</h3>
                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-base font-bold text-primary">{ad.price} π</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-medium text-muted-foreground">{ad.rating || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {ad.location}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Ads */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">All Ads</h2>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="text-sm border border-input rounded-lg px-3 py-1.5 bg-card text-foreground focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="all">All Regions</option>
              <option value="Dubai, UAE">Dubai</option>
              <option value="Cairo, Egypt">Cairo</option>
              <option value="Riyadh, KSA">Riyadh</option>
            </select>
          </div>

          {filteredAds.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-primary/50" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">No ads found</h3>
              <p className="text-sm text-muted-foreground mb-4">Be the first to post an ad!</p>
              <Link href="/post">
                <Button className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-foreground font-bold rounded-full shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Ad
                </Button>
              </Link>
            </div>
          ) : (
            <Tabs defaultValue="recent">
              <TabsContent value="recent" className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredAds.map((ad) => (
                    <Link key={ad.id} href={`/ad/${ad.id}`}>
                      <Card className="hover:shadow-lg transition-all hover:scale-[1.02] border overflow-hidden bg-card shadow-sm h-full flex flex-col">
                        <div className="relative pt-[75%]">
                          <img
                            src={ad.images[0] || "/placeholder.svg"}
                            alt={ad.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <Badge className="absolute top-2 right-2 bg-card/90 text-primary border-0 text-xs">
                            {ad.category}
                          </Badge>
                        </div>
                        <CardContent className="p-3 flex-1 flex flex-col">
                          <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1 flex-1">{ad.title}</h3>
                          <p className="text-base font-bold text-primary mb-2 mt-auto">{ad.price} π</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {ad.location}
                            </div>
                            {(ad.rating ?? 0) > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="font-medium">{ad.rating}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl z-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-5 gap-1 px-2 py-3">
            <Link href="/" className="flex justify-center">
              <Button variant="ghost" size="sm" className="flex-col space-y-1 h-auto py-2 px-3 w-full hover:bg-primary/10 rounded-xl transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#312E81] rounded-xl flex items-center justify-center shadow-md">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-primary font-bold">Home</span>
              </Button>
            </Link>

            <Link href="/search" className="flex justify-center">
              <Button variant="ghost" size="sm" className="flex-col space-y-1 h-auto py-2 px-3 w-full hover:bg-primary/10 rounded-xl transition-all">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-primary font-medium">Search</span>
              </Button>
            </Link>

            <Link href="/post" className="flex justify-center -mt-4">
              <Button
                size="sm"
                className="w-14 h-14 rounded-2xl shadow-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 hover:scale-105 transition-all duration-200 border-4 border-card"
              >
                <Plus className="w-6 h-6 text-foreground" />
              </Button>
            </Link>

            <Link href="/messages" className="flex justify-center">
              <Button variant="ghost" size="sm" className="flex-col space-y-1 h-auto py-2 px-3 w-full hover:bg-primary/10 rounded-xl transition-all relative">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-primary font-medium">Messages</span>
                {user && unreadCount > 0 && (
                  <span className="absolute top-1 right-2 w-5 h-5 bg-amber-400 text-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href={user ? "/profile" : "/auth/login"} className="flex justify-center">
              <Button variant="ghost" size="sm" className="flex-col space-y-1 h-auto py-2 px-3 w-full hover:bg-primary/10 rounded-xl transition-all">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-primary font-medium">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
