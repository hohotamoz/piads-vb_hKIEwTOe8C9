import { piSDK, type PiPaymentData } from "./pi-sdk"

export interface PiPaymentRequest {
  amount: number
  memo: string
  metadata: {
    type: "featured_ad" | "promoted_ad" | "subscription" | "purchase"
    adId?: string
    userId: string
    duration?: number
    planId?: string
  }
}

export interface PiPaymentResponse {
  identifier: string
  status: "pending" | "completed" | "cancelled" | "failed"
  amount: number
  timestamp: Date
  transactionId?: string
  metadata?: {
    type: "featured_ad" | "promoted_ad" | "subscription" | "purchase"
    adId?: string
    userId: string
    duration?: number
    planId?: string
  }
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  duration: number
  features: string[]
  popular?: boolean
}

let pricingPlansData: PricingPlan[] = [
  {
    id: "featured_7d",
    name: "Featured (7 Days)",
    price: 50,
    duration: 7,
    features: ["Top placement", "Featured badge", "2x more views", "Priority support"],
  },
  {
    id: "featured_30d",
    name: "Featured (30 Days)",
    price: 150,
    duration: 30,
    features: ["Top placement", "Featured badge", "2x more views", "Priority support", "Save 25%"],
    popular: true,
  },
  {
    id: "promoted_7d",
    name: "Promoted (7 Days)",
    price: 30,
    duration: 7,
    features: ["Boosted visibility", "Promoted badge", "1.5x more views"],
  },
  {
    id: "promoted_30d",
    name: "Promoted (30 Days)",
    price: 90,
    duration: 30,
    features: ["Boosted visibility", "Promoted badge", "1.5x more views", "Save 20%"],
  },
]

let subscriptionPlansData: PricingPlan[] = [
  {
    id: "premium_monthly",
    name: "Premium",
    price: 99,
    duration: 30,
    features: ["Unlimited ads", "Priority placement", "Advanced analytics", "No commission fees"],
    popular: true,
  },
  {
    id: "enterprise_monthly",
    name: "Enterprise",
    price: 299,
    duration: 30,
    features: ["Everything in Premium", "API access", "Custom branding", "Dedicated support", "Multi-user accounts"],
  },
]

if (typeof window !== "undefined") {
  const savedPricingPlans = localStorage.getItem("pricingPlans")
  const savedSubscriptionPlans = localStorage.getItem("subscriptionPlans")

  if (savedPricingPlans) {
    try {
      pricingPlansData = JSON.parse(savedPricingPlans)
    } catch (e) {
      console.error("[v0] Failed to load pricing plans:", e)
    }
  }

  if (savedSubscriptionPlans) {
    try {
      subscriptionPlansData = JSON.parse(savedSubscriptionPlans)
    } catch (e) {
      console.error("[v0] Failed to load subscription plans:", e)
    }
  }
}

export const getPricingPlans = (): PricingPlan[] => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("pricingPlans")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error("Failed to parse pricing plans:", e)
      }
    }
  }
  return pricingPlansData
}

export const getSubscriptionPlans = (): PricingPlan[] => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("subscriptionPlans")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error("[v0] Failed to parse subscription plans:", e)
      }
    }
  }
  return subscriptionPlansData
}

export const updatePricingPlan = (planId: string, updates: Partial<PricingPlan>): boolean => {
  const plans = getPricingPlans()
  const index = plans.findIndex((p) => p.id === planId)

  if (index === -1) return false

  plans[index] = { ...plans[index], ...updates }

  if (typeof window !== "undefined") {
    localStorage.setItem("pricingPlans", JSON.stringify(plans))
  }

  pricingPlansData = plans
  return true
}

export const updateSubscriptionPlan = (planId: string, updates: Partial<PricingPlan>): boolean => {
  const plans = getSubscriptionPlans()
  const index = plans.findIndex((p) => p.id === planId)

  if (index === -1) return false

  plans[index] = { ...plans[index], ...updates }

  if (typeof window !== "undefined") {
    localStorage.setItem("subscriptionPlans", JSON.stringify(plans))
  }

  subscriptionPlansData = plans
  return true
}

export const addPricingPlan = (plan: PricingPlan): boolean => {
  const plans = getPricingPlans()

  if (plans.find((p) => p.id === plan.id)) return false

  plans.push(plan)

  if (typeof window !== "undefined") {
    localStorage.setItem("pricingPlans", JSON.stringify(plans))
  }

  pricingPlansData = plans
  return true
}

export const deletePricingPlan = (planId: string): boolean => {
  const plans = getPricingPlans()
  const filtered = plans.filter((p) => p.id !== planId)

  if (filtered.length === plans.length) return false

  if (typeof window !== "undefined") {
    localStorage.setItem("pricingPlans", JSON.stringify(filtered))
  }

  pricingPlansData = filtered
  return true
}

export const pricingPlans = pricingPlansData
export const subscriptionPlans = subscriptionPlansData

const piPaymentService = {
  async createPayment(
    amount: number,
    memo: string,
    metadata: {
      type: "featured_ad" | "promoted_ad" | "subscription" | "purchase"
      adId?: string
      userId: string
      duration?: number
      planId?: string
    },
  ): Promise<PiPaymentResponse> {
    try {
      // Step 1: Create payment intent on backend
      console.log("[Pi Payment] Creating payment intent...", { amount, memo })
      
      const createResponse = await fetch('/api/pi-payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, memo, metadata, userId: metadata.userId })
      })

      if (!createResponse.ok) {
        throw new Error("Failed to create payment intent")
      }

      const { paymentId } = await createResponse.json()
      console.log("[Pi Payment] Payment intent created:", paymentId)

      // Step 2: Initialize Pi SDK
      await piSDK.initialize(!process.env.NEXT_PUBLIC_PI_MAINNET)

      if (!piSDK.isAuthenticated()) {
        await piSDK.authenticate()
      }

      // Step 3: Create payment with Pi SDK
      const paymentData: PiPaymentData = {
        amount,
        memo,
        metadata: { ...metadata, paymentId },
      }

      console.log("[Pi Payment] Initiating Pi payment flow...")
      const result = await piSDK.createPayment(paymentData)

      // Step 4: Approve payment on backend
      if (result.status === "completed" && result.paymentId) {
        console.log("[Pi Payment] Payment completed, approving on backend...")
        
        await fetch('/api/pi-payment/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: result.paymentId, txid: result.txid })
        })

        // Step 5: Complete payment
        await fetch('/api/pi-payment/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: result.paymentId, txid: result.txid })
        })

        console.log("[Pi Payment] Payment fully completed!")
      } else if (result.status === "cancelled") {
        console.log("[Pi Payment] Payment cancelled by user")
        
        await fetch('/api/pi-payment/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: result.paymentId })
        })
      }

      const payment: PiPaymentResponse = {
        identifier: result.paymentId,
        status: result.status === "completed" ? "completed" : result.status === "cancelled" ? "cancelled" : "failed",
        amount,
        timestamp: new Date(),
        transactionId: result.txid,
        metadata,
      }

      // Save to payment history
      if (typeof window !== "undefined") {
        const history = this.getPaymentHistory(metadata.userId)
        history.push(payment)
        localStorage.setItem(`payment_history_${metadata.userId}`, JSON.stringify(history))
      }

      return payment
    } catch (error) {
      console.error("[Pi Payment] Payment creation error:", error)
      throw error
    }
  },

  async verifyPayment(paymentId: string): Promise<{ status: string; verified: boolean }> {
    try {
      const response = await fetch(`/api/payments/verify/${paymentId}`)
      if (!response.ok) throw new Error("Verification failed")
      return await response.json()
    } catch (error) {
      console.error("Payment verification error:", error)
      return { status: "failed", verified: false }
    }
  },

  getPaymentHistory(userId: string): PiPaymentResponse[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(`payment_history_${userId}`)
    if (!stored) return []
    try {
      return JSON.parse(stored).map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp),
      }))
    } catch {
      return []
    }
  },

  formatPiAmount(amount: number): string {
    return piSDK.formatPiAmount(amount)
  },
}

export { piPaymentService }
