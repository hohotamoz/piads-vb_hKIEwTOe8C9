import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/pi-session"

/**
 * Validate payment parameters before creating a Pi payment.
 * This endpoint does NOT create a payment - it only validates and returns
 * pricing information. The actual payment is created client-side via Pi SDK.
 * 
 * The frontend must use the price returned by this endpoint, never a client-sent amount.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, adId, planId, duration } = body

    // Validate inputs
    if (!type) {
      return NextResponse.json({ error: "Payment type required" }, { status: 400 })
    }

    // Server-side pricing - NEVER accept amount from client
    let amount = 0
    let memo = ""

    switch (type) {
      case "featured_ad":
        if (duration === 7) {
          amount = 50
          memo = "Featured Ad (7 Days)"
        } else if (duration === 30) {
          amount = 150
          memo = "Featured Ad (30 Days)"
        } else {
          return NextResponse.json({ error: "Invalid duration for featured ad" }, { status: 400 })
        }
        break
      case "promoted_ad":
        if (duration === 7) {
          amount = 30
          memo = "Promoted Ad (7 Days)"
        } else if (duration === 30) {
          amount = 90
          memo = "Promoted Ad (30 Days)"
        } else {
          return NextResponse.json({ error: "Invalid duration for promoted ad" }, { status: 400 })
        }
        break
      case "subscription":
        if (planId === "premium_monthly") {
          amount = 99
          memo = "Premium Subscription (Monthly)"
        } else if (planId === "enterprise_monthly") {
          amount = 299
          memo = "Enterprise Subscription (Monthly)"
        } else {
          return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 })
        }
        break
      default:
        return NextResponse.json({ error: "Invalid payment type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      amount,
      memo,
      type,
      adId: adId || null,
      planId: planId || null,
      duration: duration || null,
      message: "Use this amount with Pi.createPayment() on the client side"
    })
  } catch (error) {
    console.error("Error validating payment:", error)
    return NextResponse.json({ error: "Failed to validate payment" }, { status: 500 })
  }
}
