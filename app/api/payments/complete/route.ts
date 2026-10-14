import { NextResponse } from "next/server"
import { getSession } from "@/lib/pi-session"

export async function POST(request: Request) {
  try {
    // 1. Verify user session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paymentId, txid } = await request.json()

    if (!paymentId || !txid) {
      return NextResponse.json({ error: "Payment ID and transaction ID required" }, { status: 400 })
    }

    // 2. Validate inputs
    if (typeof paymentId !== "string" || paymentId.length < 10) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 })
    }

    if (typeof txid !== "string" || txid.length < 10) {
      return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 })
    }

    // 3. Call Pi Platform API to complete payment
    const piApiUrl = process.env.PI_API_URL || "https://api.minepi.com"
    const apiKey = process.env.PI_API_KEY

    if (!apiKey) {
      console.error("[Payments] PI_API_KEY not configured")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    const response = await fetch(`${piApiUrl}/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify({ txid }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[Payments] Completion failed:", response.status, errorData)
      return NextResponse.json(
        { error: errorData.error || "Payment completion failed" },
        { status: response.status }
      )
    }

    const data = await response.json()

    // 4. Verify the payment is actually completed
    if (!data.status?.developer_completed) {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      payment: data,
    })
  } catch (error) {
    console.error("[Payments] Completion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
