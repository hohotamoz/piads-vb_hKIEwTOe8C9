"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, Crown, Zap, Sparkles, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { piPaymentService, getSubscriptionPlans } from "@/lib/pi-payment"
import { useToast } from "@/hooks/use-toast"

export default function SubscriptionPage() {
  const router = useRouter()
  const { isAuthenticated, userData, piAccessToken, reinitialize } = usePiAuth()
  const { toast } = useToast()
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null)

  const subscriptionPlans = getSubscriptionPlans()

  useState(() => {
    if (typeof window !== "undefined" && userData) {
      const saved = localStorage.getItem(`subscription_${userData.id}`)
      if (saved) {
        try {
          const sub = JSON.parse(saved)
          // Check if subscription is still active
          const expiryDate = new Date(sub.expiryDate)
          if (expiryDate > new Date()) {
            setCurrentSubscription(sub.planId)
          } else {
            localStorage.removeItem(`subscription_${userData.id}`)
          }
        } catch (e) {
          console.error("[v0] Failed to load subscription:", e)
        }
      }
    }
  })

  const handleSubscribe = async (planId: string, amount: number, planName: string) => {
    if (!isAuthenticated || !userData) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe",
        variant: "destructive",
      })
      await reinitialize()
      return
    }

    setLoadingPlanId(planId)

    try {
      console.log("[v0] Starting subscription payment for plan:", planId)

      const payment = await piPaymentService.createPayment(amount, `Subscription: ${planName}`, {
        type: "subscription",
        userId: userData.id,
        planId: planId,
        duration: 30,
      })

      console.log("[v0] Payment result:", payment)

      if (payment.status === "completed") {
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 30)

        const subscription = {
          planId,
          planName,
          amount,
          startDate: new Date().toISOString(),
          expiryDate: expiryDate.toISOString(),
          transactionId: payment.transactionId,
        }

        localStorage.setItem(`subscription_${userData.id}`, JSON.stringify(subscription))
        setCurrentSubscription(planId)

        toast({
          title: "Subscription Activated!",
          description: `You are now subscribed to ${planName}`,
        })

        // Redirect to profile after 2 seconds
        setTimeout(() => {
          router.push("/profile")
        }, 2000)
      } else if (payment.status === "cancelled") {
        toast({
          title: "Payment Cancelled",
          description: "Your subscription payment was cancelled",
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
      console.error("[v0] Subscription error:", error)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Subscription Plans</h1>
              <p className="text-sm text-slate-500">Choose the perfect plan for you</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-24 space-y-6">
        {/* Hero Section */}
        <div className="text-center py-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Upgrade to Premium</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Unlock unlimited features and take your advertising to the next level
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="space-y-4">
          {subscriptionPlans.map((plan) => {
            const isActive = currentSubscription === plan.id
            const isLoading = loadingPlanId === plan.id
            const Icon = plan.popular ? Sparkles : plan.price > 200 ? Crown : Zap

            return (
              <Card
                key={plan.id}
                className={`border-2 transition-all ${
                  plan.popular
                    ? "border-blue-500 shadow-lg shadow-blue-100"
                    : isActive
                      ? "border-green-500 shadow-lg shadow-green-100"
                      : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                {isActive && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-2 text-sm font-semibold">
                    Current Plan
                  </div>
                )}

                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          plan.popular
                            ? "bg-gradient-to-br from-blue-100 to-purple-100"
                            : "bg-gradient-to-br from-slate-100 to-slate-200"
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${plan.popular ? "text-blue-600" : "text-slate-600"}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>Monthly subscription</CardDescription>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-2xl text-slate-600">π</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Subscribe Button */}
                  <Button
                    onClick={() => handleSubscribe(plan.id, plan.price, plan.name)}
                    disabled={isActive || isLoading}
                    className={`w-full h-12 text-base font-semibold ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isActive ? (
                      "Current Plan"
                    ) : (
                      <>Subscribe Now</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Payment Info */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900">Secure Pi Network Payment</p>
                <p className="text-xs text-blue-700">
                  All payments are processed securely through Pi Network. Your subscription will be activated
                  immediately after payment confirmation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <p className="text-xs text-center text-slate-500 px-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy. Subscriptions automatically renew
          monthly unless cancelled.
        </p>
      </div>
    </div>
  )
}
