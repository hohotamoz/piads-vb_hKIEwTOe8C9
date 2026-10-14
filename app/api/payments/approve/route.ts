import { NextResponse } from "next/server"
import { getSession } from "@/lib/pi-session"

export async function POST(request: Request) {
  try {
    // 1. Verify user session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 })
    }

    // 2. Verify paymentId format (should be a valid Pi payment ID)
    if (typeof paymentId !== "string" || paymentId.length < 10) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 })
    }

    // 3. Call Pi Platform API to approve payment
    const piApiUrl = process.env.PI_API_URL || "https://api.minepi.com"
    const apiKey = process.env.PI_API_KEY

    if (!apiKey) {
      console.error("[Payments] PI_API_KEY not configured")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    const response = await fetch(`${piApiUrl}/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${apiKey}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[Payments] Approval failed:", response.status, errorData)
      return NextResponse.json(
        { error: errorData.error || "Payment approval failed" },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      payment: data,
    })
  } catch (error) {
    console.error("[Payments] Approval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
