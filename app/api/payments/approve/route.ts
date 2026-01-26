import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json()
    const authHeader = request.headers.get("authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken = authHeader.substring(7)

    // Verify with Pi Network backend
    const piBackendUrl = process.env.PI_API_URL || "https://api.minepi.com"
    const response = await fetch(`${piBackendUrl}/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${process.env.PI_API_KEY}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Payment approval failed" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payment approval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
