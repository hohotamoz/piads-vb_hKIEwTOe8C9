import { type NextRequest, NextResponse } from "next/server"

interface PaymentRequest {
  amount: number
  memo: string
  metadata: {
    type: string
    userId: string
    adId?: string
    duration?: number
    planId?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json()
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substring(7)}`

    return NextResponse.json({
      paymentId,
      amount: body.amount,
      memo: body.memo,
      metadata: body.metadata,
      status: "pending",
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
