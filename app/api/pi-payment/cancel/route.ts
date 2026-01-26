import { NextRequest, NextResponse } from "next/server"

// Pi Network payment cancellation endpoint
// Called when user cancels the payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "Payment ID is required" },
        { status: 400 }
      )
    }

    console.log("[Pi Payment] Cancelling payment:", paymentId)

    // Update payment status to cancelled
    const payment = {
      id: paymentId,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "Payment cancelled",
      payment,
    })
  } catch (error) {
    console.error("Error cancelling payment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to cancel payment" },
      { status: 500 }
    )
  }
}
