"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Search, SlidersHorizontal, MapPin, Star, TrendingUp, Clock, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getAds } from "@/lib/database"

const popularSearches = ["iPhone 15", "Web Development", "Graphic Design", "Car", "Apartment", "Laptop"]

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [hasSearched, setHasSearched] = useState(!!searchParams.get("q"))
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<"relevant" | "price-low" | "price-high" | "rating" | "newest">("relevant")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const categories = ["Electronics", "Services", "Fashion", "Home & Garden", "Vehicles", "Jobs"]
  const locations = ["Dubai", "Cairo", "Riyadh", "Amman", "Doha"]

  useEffect(() => {
    if (hasSearched) {
      performSearch()
    }
  }, [hasSearched])

  const performSearch = async () => {
    try {
      setIsLoading(true)
      const allAds = await getAds({ status: 'active' })
      
      // Filter by search query
      const filtered = allAds.filter(ad => 
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      
      setSearchResults(filtered)
    } catch (error) {
      console.error("Error searching ads:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true)
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) => (prev.includes(location) ? prev.filter((l) => l !== location) : [...prev, location]))
  }

  const clearFilters = () => {
    setPriceRange([0, 5000])
    setSelectedCategories([])
    setSelectedLocations([])
    setMinRating(0)
    setShowFeaturedOnly(false)
  }

  const filteredResults = searchResults
    .filter((ad) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(ad.category)) return false
      if (selectedLocations.length > 0 && !selectedLocations.includes(ad.region)) return false
      if (ad.price < priceRange[0] || ad.price > priceRange[1]) return false
      if (showFeaturedOnly && !ad.is_promoted) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

  const activeFiltersCount =
    selectedCategories.length + selectedLocations.length + (minRating > 0 ? 1 : 0) + (showFeaturedOnly ? 1 : 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3 mb-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 hover:bg-slate-100 rounded-full">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search ads, services, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 pr-4 py-2.5 w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                autoFocus
              />
            </div>
            <Button
              onClick={handleSearch}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 shadow-md rounded-xl"
            >
              Search
            </Button>
          </div>

          {/* Filters */}
          {hasSearched && (
            <div className="flex items-center space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 border-slate-200 text-slate-700 bg-white relative"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-1" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center justify-between">
                      <span>Advanced Filters</span>
                      {activeFiltersCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-emerald-600">
                          Clear All
                        </Button>
                      )}
                    </SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6 mt-6">
                    {/* Price Range */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Price Range (π)</h3>
                      <div className="px-2">
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={5000}
                          min={0}
                          step={50}
                          className="mb-4"
                        />
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>{priceRange[0]} π</span>
                          <span>{priceRange[1]} π</span>
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Categories</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cat-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <label htmlFor={`cat-${category}`} className="text-sm text-slate-700 cursor-pointer flex-1">
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Locations */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Locations</h3>
                      <div className="space-y-2">
                        {locations.map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox
                              id={`loc-${location}`}
                              checked={selectedLocations.includes(location)}
                              onCheckedChange={() => toggleLocation(location)}
                            />
                            <label htmlFor={`loc-${location}`} className="text-sm text-slate-700 cursor-pointer flex-1">
                              {location}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Featured Only */}
                    <div>
                      <div className="flex items-center space-x-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <Checkbox
                          id="featured"
                          checked={showFeaturedOnly}
                          onCheckedChange={(checked) => setShowFeaturedOnly(checked as boolean)}
                        />
                        <label htmlFor="featured" className="text-sm text-slate-900 cursor-pointer flex-1">
                          <div className="font-medium">Featured Ads Only</div>
                          <div className="text-xs text-slate-600">Show premium listings</div>
                        </label>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-white text-slate-700"
              >
                <option value="relevant">Most Relevant</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          )}
        </div>
      </header>

      <div className="p-4 pb-24">
        {hasSearched && activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="bg-emerald-100 text-emerald-700 border-0 pr-1 cursor-pointer"
                onClick={() => toggleCategory(cat)}
              >
                {cat}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {selectedLocations.map((loc) => (
              <Badge
                key={loc}
                variant="secondary"
                className="bg-blue-100 text-blue-700 border-0 pr-1 cursor-pointer"
                onClick={() => toggleLocation(loc)}
              >
                {loc}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {showFeaturedOnly && (
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 border-0 pr-1 cursor-pointer"
                onClick={() => setShowFeaturedOnly(false)}
              >
                Featured Only
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
        )}

        {!hasSearched ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Popular Searches</h2>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search) => (
                  <Button
                    key={search}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(search)
                      setHasSearched(true)
                    }}
                    className="border-slate-200 hover:border-emerald-500 hover:text-emerald-600"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {search}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent Searches</h2>
              <div className="space-y-2">
                {["iPhone 13", "Graphic Designer", "Apartment Dubai"].map((search) => (
                  <div
                    key={search}
                    onClick={() => {
                      setSearchQuery(search)
                      setHasSearched(true)
                    }}
                    className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-sm text-slate-700 flex-1">{search}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-emerald-600" />
            </div>
            <p className="text-sm text-slate-600">Searching...</p>
          </div>
        ) : (
          /* Search Results */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} for "{searchQuery}"
              </h2>
            </div>

            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No results found</h3>
                <p className="text-sm text-slate-500 mb-4">Try adjusting your filters or search terms</p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-emerald-500 text-emerald-600 bg-transparent"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((ad) => (
                  <Link key={ad.id} href={`/ad/${ad.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-all border-slate-200 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="relative w-28 h-28 flex-shrink-0">
                            <img
                              src={ad.images[0] || "/placeholder.svg"}
                              alt={ad.title}
                              className="w-full h-full object-cover"
                            />
                            {ad.is_promoted && (
                              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1 p-3">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-medium text-slate-900 text-sm leading-tight pr-2">{ad.title}</h3>
                            </div>
                            <div className="flex items-center space-x-1 mb-2">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs text-slate-600 font-medium">4.5</span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-600">{ad.views || 0} views</span>
                            </div>
                            <Badge variant="secondary" className="text-xs mb-2 bg-slate-100 text-slate-700 border-0">
                              {ad.category}
                            </Badge>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-500">{ad.region}</span>
                              </div>
                              <span className="font-bold text-emerald-600 text-sm">{ad.price} π</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
