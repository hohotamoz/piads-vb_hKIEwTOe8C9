import { NextResponse } from "next/server"
import { getSession } from "@/lib/pi-session"
import { verifyPaymentWithPiAPI } from "@/lib/pi-payment-verification"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    // Verify user session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paymentId } = await params

    if (!paymentId || typeof paymentId !== "string" || paymentId.length < 10) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 })
    }

    // Verify payment with Pi Platform API
    const result = await verifyPaymentWithPiAPI(paymentId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
