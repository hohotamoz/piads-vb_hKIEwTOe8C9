import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/pi-session"

/**
 * Validate a payment approval request.
 * The actual approval is handled by the Pi Platform API in /api/payments/approve
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId } = body

    if (!paymentId || typeof paymentId !== "string" || paymentId.length < 10) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Payment ID validated. Use /api/payments/approve for actual approval.",
      paymentId,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
