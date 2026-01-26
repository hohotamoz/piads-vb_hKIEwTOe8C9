import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const { paymentId } = params

    console.log("[v0] Verifying payment:", paymentId)

    // This would query your backend database or Pi Network API

    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      paymentId,
      status: "completed",
      verified: true,
    })
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
