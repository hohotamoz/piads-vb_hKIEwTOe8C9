"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, Zap, Star, TrendingUp, Loader2 } from "lucide-react"
import { getPricingPlans, getSubscriptionPlans, piPaymentService } from "@/lib/pi-payment"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function PromotePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pricingPlans, setPricingPlans] = useState([])
  const [subscriptionPlans, setSubscriptionPlans] = useState([])
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setPricingPlans(getPricingPlans())
    setSubscriptionPlans(getSubscriptionPlans())
  }, [])

  const handlePurchase = async (planId: string, amount: number, planName: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase a plan",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    setSelectedPlan(planId)
    setIsProcessing(true)

    try {
      console.log("[v0] Starting payment for plan:", planId)

      const payment = await piPaymentService.createPayment(amount, `Purchase: ${planName}`, {
        type:
          planId.includes("subscription") || planId.includes("premium") || planId.includes("enterprise")
            ? "subscription"
            : planId.includes("featured")
              ? "featured_ad"
              : "promoted_ad",
        userId: user.id,
        adId: "sample_ad_id",
        planId,
      })

      console.log("[v0] Payment result:", payment)

      if (payment.status === "completed") {
        toast({
          title: "Payment Successful!",
          description: `Your ${planName} plan is now active`,
        })

        setTimeout(() => {
          router.push("/profile")
        }, 2000)
      } else if (payment.status === "cancelled") {
        toast({
          title: "Payment Cancelled",
          description: "Your payment was cancelled",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Payment Failed",
          description: "There was an error processing your payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Payment failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Promote Your Ad</h1>
              <p className="text-sm text-slate-500">Boost visibility with Pi</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Benefits Section */}
        <Card className="mb-6 border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Why Promote?</h2>
                <p className="text-sm text-slate-600">Reach more buyers faster</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700">2-3x more views</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700">Top search results</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700">Sell faster</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promotion Plans */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Ad Promotion</h2>
          <div className="space-y-3">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`border-2 transition-all cursor-pointer ${
                  plan.popular ? "border-emerald-500 shadow-md" : "border-slate-200"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-slate-900">{plan.name}</h3>
                        {plan.popular && <Badge className="bg-emerald-600 text-white border-0 text-xs">Popular</Badge>}
                      </div>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-emerald-600">{plan.price} π</span>
                        <span className="text-sm text-slate-500">for {plan.duration} days</span>
                      </div>
                    </div>
                    {plan.name.includes("Featured") ? (
                      <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                    ) : (
                      <TrendingUp className="w-6 h-6 text-blue-500" />
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePurchase(plan.id, plan.price, plan.name)}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>Purchase with Pi</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscription Plans */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Subscription Plans</h2>
          <div className="space-y-3">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`border-2 transition-all ${
                  plan.popular ? "border-emerald-500 shadow-md" : "border-slate-200"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-slate-900">{plan.name}</h3>
                        {plan.popular && (
                          <Badge className="bg-emerald-600 text-white border-0 text-xs">Best Value</Badge>
                        )}
                      </div>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-emerald-600">{plan.price} π</span>
                        <span className="text-sm text-slate-500">/month</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePurchase(plan.id, plan.price, plan.name)}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>Subscribe</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <Card className="mt-6 border-0 shadow-sm bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">π</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 mb-1">Secure Pi Network Payment</h3>
                <p className="text-sm text-slate-600">
                  All payments are processed securely through Pi Network. Your Pi wallet will be used for transactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
