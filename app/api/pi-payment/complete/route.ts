import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/pi-session"

/**
 * Validate a payment completion request.
 * The actual completion is handled by the Pi Platform API in /api/payments/complete
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, txid } = body

    if (!paymentId || typeof paymentId !== "string" || paymentId.length < 10) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 })
    }

    if (!txid || typeof txid !== "string" || txid.length < 10) {
      return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Payment data validated. Use /api/payments/complete for actual completion.",
      paymentId,
      txid,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
