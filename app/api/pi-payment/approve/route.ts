import { NextRequest, NextResponse } from "next/server"

// Pi Network payment approval endpoint
// This is called by Pi SDK after user confirms payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, txid } = body

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "Payment ID is required" },
        { status: 400 }
      )
    }

    // In production: Verify payment with Pi Network API
    // const apiKey = process.env.PI_API_KEY
    // const verified = await verifyPaymentWithPiAPI(paymentId, txid, apiKey)

    // For now, we approve automatically
    // In production, you MUST verify with Pi API before approving

    console.log("[Pi Payment] Approving payment:", paymentId, txid)

    // Update payment status
    const payment = {
      id: paymentId,
      txid,
      status: "completed",
      approvedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "Payment approved",
      payment,
    })
  } catch (error) {
    console.error("Error approving payment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to approve payment" },
      { status: 500 }
    )
  }
}
