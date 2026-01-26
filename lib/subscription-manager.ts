import type { User } from "./types"

export interface SubscriptionPlan {
  id: string
  name: string
  nameAr: string
  price: number
  duration: number // days
  features: string[]
  featuresAr: string[]
  limits: {
    maxAds: number
    featuredAds: number
    promotedAds: number
    prioritySupport: boolean
    analytics: boolean
    noCommission: boolean
  }
  popular?: boolean
}

export interface UserSubscription {
  userId: string
  planId: string
  planName: string
  startDate: Date
  expiryDate: Date
  status: "active" | "expired" | "cancelled"
  transactionId: string
  amount: number
}

const SUBSCRIPTION_STORAGE_KEY = "piads_subscriptions"
const PLANS_STORAGE_KEY = "piads_subscription_plans"

// Default subscription plans
const defaultPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    nameAr: "أساسي",
    price: 0,
    duration: 30,
    features: ["Up to 5 ads", "Standard support", "Basic features"],
    featuresAr: ["حتى 5 إعلانات", "دعم قياسي", "ميزات أساسية"],
    limits: {
      maxAds: 5,
      featuredAds: 0,
      promotedAds: 0,
      prioritySupport: false,
      analytics: false,
      noCommission: false,
    },
  },
  {
    id: "premium",
    name: "Premium",
    nameAr: "بريميوم",
    price: 99,
    duration: 30,
    features: [
      "Unlimited ads",
      "5 Featured ads/month",
      "Priority support",
      "Advanced analytics",
      "No commission fees",
    ],
    featuresAr: [
      "إعلانات غير محدودة",
      "5 إعلانات مميزة شهرياً",
      "دعم أولوية",
      "تحليلات متقدمة",
      "بدون عمولة",
    ],
    limits: {
      maxAds: -1, // unlimited
      featuredAds: 5,
      promotedAds: 10,
      prioritySupport: true,
      analytics: true,
      noCommission: true,
    },
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    nameAr: "إنتربرايز",
    price: 299,
    duration: 30,
    features: [
      "Everything in Premium",
      "Unlimited featured ads",
      "API access",
      "Custom branding",
      "Dedicated support",
      "Multi-user accounts",
    ],
    featuresAr: [
      "كل ميزات بريميوم",
      "إعلانات مميزة غير محدودة",
      "وصول API",
      "علامة تجارية مخصصة",
      "دعم مخصص",
      "حسابات متعددة المستخدمين",
    ],
    limits: {
      maxAds: -1,
      featuredAds: -1,
      promotedAds: -1,
      prioritySupport: true,
      analytics: true,
      noCommission: true,
    },
  },
]

// Get all subscription plans
export function getSubscriptionPlans(): SubscriptionPlan[] {
  if (typeof window === "undefined") return defaultPlans

  try {
    const stored = localStorage.getItem(PLANS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Error loading subscription plans:", error)
  }

  // Save default plans
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(defaultPlans))
  return defaultPlans
}

// Get all subscriptions
function getAllSubscriptions(): UserSubscription[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY)
    if (!stored) return []

    const subs = JSON.parse(stored)
    return subs.map((sub: any) => ({
      ...sub,
      startDate: new Date(sub.startDate),
      expiryDate: new Date(sub.expiryDate),
    }))
  } catch (error) {
    console.error("Error loading subscriptions:", error)
    return []
  }
}

// Save subscriptions
function saveSubscriptions(subscriptions: UserSubscription[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscriptions))
  } catch (error) {
    console.error("Error saving subscriptions:", error)
  }
}

// Get user's active subscription
export function getUserSubscription(userId: string): UserSubscription | null {
  const subscriptions = getAllSubscriptions()
  const userSub = subscriptions.find(
    (sub) => sub.userId === userId && sub.status === "active" && new Date() < sub.expiryDate
  )

  if (userSub && new Date() >= userSub.expiryDate) {
    userSub.status = "expired"
    saveSubscriptions(subscriptions)
    return null
  }

  return userSub || null
}

// Create or update subscription
export function createSubscription(
  userId: string,
  planId: string,
  transactionId: string,
  amount: number
): UserSubscription | null {
  const plans = getSubscriptionPlans()
  const plan = plans.find((p) => p.id === planId)

  if (!plan) {
    console.error("Plan not found:", planId)
    return null
  }

  const subscriptions = getAllSubscriptions()

  // Deactivate existing subscriptions
  subscriptions.forEach((sub) => {
    if (sub.userId === userId && sub.status === "active") {
      sub.status = "cancelled"
    }
  })

  const startDate = new Date()
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + plan.duration)

  const newSubscription: UserSubscription = {
    userId,
    planId: plan.id,
    planName: plan.name,
    startDate,
    expiryDate,
    status: "active",
    transactionId,
    amount,
  }

  subscriptions.push(newSubscription)
  saveSubscriptions(subscriptions)

  return newSubscription
}

// Check if user can perform action based on subscription
export function canUserPerformAction(userId: string, action: keyof SubscriptionPlan["limits"]): boolean {
  const subscription = getUserSubscription(userId)
  const plans = getSubscriptionPlans()

  if (!subscription) {
    // User has no subscription, use basic plan limits
    const basicPlan = plans.find((p) => p.id === "basic")
    return basicPlan ? basicPlan.limits[action] === true || basicPlan.limits[action] === -1 : false
  }

  const plan = plans.find((p) => p.id === subscription.planId)
  if (!plan) return false

  const limit = plan.limits[action]
  return limit === true || limit === -1
}

// Get user's ad limit
export function getUserAdLimit(userId: string): number {
  const subscription = getUserSubscription(userId)
  const plans = getSubscriptionPlans()

  if (!subscription) {
    // No subscription = Basic plan (5 ads)
    const basicPlan = plans.find((p) => p.id === "basic")
    const limit = basicPlan?.limits.maxAds ?? 5
    console.log("[v0] User ad limit (no subscription):", { userId, limit, basicPlan })
    return limit
  }

  const plan = plans.find((p) => p.id === subscription.planId)
  const limit = plan?.limits.maxAds ?? 5
  console.log("[v0] User ad limit (with subscription):", { userId, planId: subscription.planId, limit })
  return limit
}

// Check if user has reached ad limit
export function hasReachedAdLimit(userId: string, currentAdCount: number): boolean {
  const limit = getUserAdLimit(userId)
  return limit !== -1 && currentAdCount >= limit
}

// Get subscription status display
export function getSubscriptionStatus(userId: string): {
  isActive: boolean
  planName: string
  expiryDate: Date | null
} {
  const subscription = getUserSubscription(userId)

  if (!subscription) {
    return {
      isActive: false,
      planName: "Basic",
      expiryDate: null,
    }
  }

  return {
    isActive: true,
    planName: subscription.planName,
    expiryDate: subscription.expiryDate,
  }
}
