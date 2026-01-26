"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Wallet,
  Bell,
  Settings,
  Star,
  MessageSquare,
  ShoppingBag,
  LogOut,
  Crown,
  Zap,
  Check,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { piPaymentService, getSubscriptionPlans, type PricingPlan } from "@/lib/pi-payment"
import { useToast } from "@/hooks/use-toast"
import { createSubscription } from "@/lib/subscription-manager"

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const { isAuthenticated, userData, reinitialize } = usePiAuth()
  const { toast } = useToast()

  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false)
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null)

  const subscriptionPlans = getSubscriptionPlans()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
          </div>
          <p className="text-sm text-primary font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-500"
      case "developer":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-500"
      case "store":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-500"
      case "advertiser":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!isAuthenticated || !userData) {
      toast({
        title: "Authentication Required",
        description: "Please connect to Pi Network first",
        variant: "destructive",
      })
      await reinitialize()
      return
    }

    setLoadingPlanId(plan.id)

    try {
      const payment = await piPaymentService.createPayment(plan.price, `Subscription: ${plan.name}`, {
        type: "subscription",
        userId: userData.id,
        planId: plan.id,
        duration: plan.duration,
      })

      if (payment.status === "completed") {
        const subscription = createSubscription(
          user.id,
          plan.id,
          payment.transactionId || payment.identifier,
          plan.price
        )

        if (subscription) {
          setCurrentSubscription(plan.id)
          toast({
            title: "Subscription Activated! 🎉",
            description: `You are now subscribed to ${plan.name}. Expires on ${subscription.expiryDate.toLocaleDateString()}`,
          })
          setIsSubscriptionDialogOpen(false)
        }
      } else if (payment.status === "cancelled") {
        toast({
          title: "Payment Cancelled",
          description: "Your subscription payment was cancelled",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process subscription",
        variant: "destructive",
      })
    } finally {
      setLoadingPlanId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-[#312E81] sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0 hover:bg-white/10 rounded-full">
                <ArrowLeft className="w-4 h-4 text-white" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">Profile</h1>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto p-4 pb-20">
        {/* Profile Card */}
        <Card className="mb-6 border shadow-lg bg-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-[#5B4B9E] rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                  {user.verified && <Badge className="bg-primary text-white border-0 text-xs">Verified</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{user.stats?.totalAds || 0}</p>
                <p className="text-xs text-muted-foreground">Active Ads</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{user.stats?.averageRating?.toFixed(1) || "N/A"}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{user.stats?.totalRatings || 0}</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Wallet Card - Takes full width on mobile, half on desktop */}
          <div className="md:col-span-2">
            <Card className="mb-6 border-0 shadow-lg bg-gradient-to-br from-primary to-[#312E81]">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/70">Pi Network Balance</p>
                    <h2 className="text-3xl font-bold text-white">{userData?.credits_balance?.toFixed(2) || "0.00"} π</h2>
                  </div>
                </div>
                {userData && isAuthenticated ? (
                  <div className="bg-white/10 rounded-lg p-3 mb-3">
                    <p className="text-xs text-white/60 mb-1">Connected Account</p>
                    <p className="text-sm text-white font-mono">@{userData.username}</p>
                  </div>
                ) : (
                  <Button
                    onClick={() => reinitialize()}
                    className="w-full bg-amber-400 text-foreground hover:bg-amber-500 font-semibold mb-3 dark:text-black"
                  >
                    Connect Pi Network
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/wallet" className="block">
                    <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                      <Wallet className="w-4 h-4 mr-2" />
                      Wallet
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setIsSubscriptionDialogOpen(true)}
                    variant="secondary"
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items Grid */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {user.role === "admin" && (
              <Link href="/admin">
                <Card className="border shadow-sm cursor-pointer hover:shadow-md transition-all bg-card h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-900/10 rounded-xl flex items-center justify-center">
                        <Crown className="w-5 h-5 text-red-600 dark:text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Admin Dashboard</p>
                        <p className="text-xs text-muted-foreground">Manage platform</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            <Link href="/my-ads">
              <Card className="border shadow-sm cursor-pointer hover:shadow-md transition-all bg-card h-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">My Ads</p>
                      <p className="text-xs text-muted-foreground">View and manage your ads</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reviews">
              <Card className="border shadow-sm cursor-pointer hover:shadow-md transition-all bg-card h-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/10 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Reviews & Ratings</p>
                      <p className="text-xs text-muted-foreground">Manage your feedback</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/messages">
              <Card className="border shadow-sm cursor-pointer hover:shadow-md transition-all bg-card h-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Messages</p>
                      <p className="text-xs text-muted-foreground">Chat with buyers/sellers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/notifications">
              <Card className="border shadow-sm cursor-pointer hover:shadow-md transition-all bg-card h-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Notifications</p>
                      <p className="text-xs text-muted-foreground">Manage alerts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/settings">
              <Card className="border shadow-sm cursor-pointer hover:shadow-md transition-all bg-card h-full">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Settings</p>
                      <p className="text-xs text-muted-foreground">Account preferences</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-auto py-4 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-red-950/10 dark:hover:bg-red-900/20 dark:text-red-500 bg-card md:col-span-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center space-x-2 text-foreground">
              <Crown className="w-6 h-6 text-amber-500" />
              <span>Premium Subscription</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">Choose a plan and unlock premium features with Pi Network payment</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {subscriptionPlans.map((plan) => {
              const isActive = currentSubscription === plan.id
              const isLoadingPlan = loadingPlanId === plan.id

              return (
                <Card
                  key={plan.id}
                  className={`border-2 transition-all bg-card ${plan.popular ? "border-amber-500 shadow-lg" : isActive ? "border-green-500" : "border-border"
                    }`}
                >
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-black text-center py-1.5 text-xs font-bold">
                      Most Popular
                    </div>
                  )}

                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground">Monthly subscription</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{plan.price} π</p>
                        <p className="text-xs text-muted-foreground">/month</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleSubscribe(plan)}
                      disabled={isActive || isLoadingPlan}
                      className={`w-full ${plan.popular
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                        }`}
                    >
                      {isLoadingPlan ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isActive ? (
                        "Current Plan"
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Subscribe with Pi
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
