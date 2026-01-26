import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { paymentId, txid } = await request.json()
    const authHeader = request.headers.get("authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken = authHeader.substring(7)

    // Verify with Pi Network backend
    const piBackendUrl = process.env.PI_API_URL || "https://api.minepi.com"
    const response = await fetch(`${piBackendUrl}/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${process.env.PI_API_KEY}`,
      },
      body: JSON.stringify({ txid }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Payment completion failed" }, { status: 400 })
    }

    const data = await response.json()

    // Store payment in database
    // In production, save to your database here

    return NextResponse.json({ success: true, payment: data })
  } catch (error) {
    console.error("Payment completion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
