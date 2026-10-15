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

export const getPricingPlans = (): PricingPlan[] => {
  return pricingPlansData
}

export const getSubscriptionPlans = (): PricingPlan[] => {
  return subscriptionPlansData
}

/**
 * Update a promotion pricing plan in the in-memory catalog.
 * Note: this does not persist changes across server restarts or deployments.
 * Persist pricing changes in a database before relying on this for production.
 */
export const updatePricingPlan = (planId: string, updates: Partial<PricingPlan>): boolean => {
  const index = pricingPlansData.findIndex((plan) => plan.id === planId)
  if (index === -1) return false

  const current = pricingPlansData[index]
  pricingPlansData[index] = {
    ...current,
    ...updates,
    id: current.id,
    price: typeof updates.price === "number" && Number.isFinite(updates.price) && updates.price >= 0
      ? updates.price
      : current.price,
    duration: typeof updates.duration === "number" && Number.isFinite(updates.duration) && updates.duration > 0
      ? updates.duration
      : current.duration,
    name: typeof updates.name === "string" && updates.name.trim()
      ? updates.name.trim()
      : current.name,
  }
  return true
}

/**
 * Update a subscription plan in the in-memory catalog.
 * Note: this does not persist changes across server restarts or deployments.
 */
export const updateSubscriptionPlan = (planId: string, updates: Partial<PricingPlan>): boolean => {
  const index = subscriptionPlansData.findIndex((plan) => plan.id === planId)
  if (index === -1) return false

  const current = subscriptionPlansData[index]
  subscriptionPlansData[index] = {
    ...current,
    ...updates,
    id: current.id,
    price: typeof updates.price === "number" && Number.isFinite(updates.price) && updates.price >= 0
      ? updates.price
      : current.price,
    duration: typeof updates.duration === "number" && Number.isFinite(updates.duration) && updates.duration > 0
      ? updates.duration
      : current.duration,
    name: typeof updates.name === "string" && updates.name.trim()
      ? updates.name.trim()
      : current.name,
  }
  return true
}

/**
 * Delete a promotion pricing plan from the in-memory catalog.
 * Subscription plans are intentionally not removed by this function.
 */
export const deletePricingPlan = (planId: string): boolean => {
  const index = pricingPlansData.findIndex((plan) => plan.id === planId)
  if (index === -1) return false
  pricingPlansData.splice(index, 1)
  return true
}

const piPaymentService = {
  /**
   * Create a real Pi payment using the official SDK flow:
   * 1. Initialize Pi SDK (sandbox=false for Testnet)
   * 2. Authenticate user with Pi
   * 3. Create payment via Pi.createPayment()
   * 4. Server approves payment via Platform API
   * 5. Server completes payment via Platform API
   * 6. Deliver service only after successful completion
   */
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
      // Follow the environment detected by the shared SDK configuration.
      await piSDK.initialize()

      // Step 2: Authenticate with Pi Network
      if (!piSDK.isAuthenticated()) {
        await piSDK.authenticate()
      }

      // Step 3: Create payment via Pi SDK
      // The SDK will call onReadyForServerApproval and onReadyForServerCompletion
      // which will forward to our backend for real Platform API calls
      const paymentData: PiPaymentData = {
        amount,
        memo,
        metadata,
      }

      console.log("[Pi Payment] Initiating Pi payment flow...")
      const result = await piSDK.createPayment(paymentData)

      const payment: PiPaymentResponse = {
        identifier: result.paymentId,
        status: result.status === "completed" ? "completed" : result.status === "cancelled" ? "cancelled" : "failed",
        amount,
        timestamp: new Date(),
        transactionId: result.txid,
        metadata,
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

  formatPiAmount(amount: number): string {
    return piSDK.formatPiAmount(amount)
  },
}

export { piPaymentService }
