/**
 * Pi Payment Verification Utilities
 * For verifying payments with Pi Network Platform API
 * 
 * IMPORTANT: These functions must ONLY be called from the backend (server-side)
 * Never expose PI_API_KEY in client-side code
 */

export interface PiPaymentVerificationResult {
  verified: boolean
  status: "completed" | "pending" | "cancelled" | "failed"
  amount?: number
  from?: string
  to?: string
  timestamp?: string
  error?: string
}

/**
 * Verify payment status with Pi Network Platform API
 * Uses Server API Key authorization
 */
export async function verifyPaymentWithPiAPI(
  paymentId: string,
  apiKey?: string
): Promise<PiPaymentVerificationResult> {
  try {
    const key = apiKey || process.env.PI_API_KEY
    const apiUrl = process.env.PI_API_URL || "https://api.minepi.com"

    if (!key) {
      return {
        verified: false,
        status: "failed",
        error: "API key not configured",
      }
    }

    // Call Pi Platform API to verify payment
    const response = await fetch(
      `${apiUrl}/v2/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Key ${key}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      return {
        verified: false,
        status: "failed",
        error: `API request failed: ${response.status}`,
      }
    }

    const data = await response.json()

    // Check payment status
    const isCompleted = data.status?.developer_completed === true
    const isCancelled = data.status?.cancelled === true || data.status?.user_cancelled === true

    return {
      verified: isCompleted,
      status: isCancelled ? "cancelled" : isCompleted ? "completed" : "pending",
      amount: data.amount,
      from: data.from_address,
      to: data.to_address,
      timestamp: data.created_at,
    }
  } catch (error) {
    console.error("[Pi Payment Verification] Error:", error)
    return {
      verified: false,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Approve payment via Pi Platform API (server-side only)
 */
export async function approvePaymentWithPiAPI(
  paymentId: string,
  apiKey?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = apiKey || process.env.PI_API_KEY
    const apiUrl = process.env.PI_API_URL || "https://api.minepi.com"

    if (!key) {
      return { success: false, error: "API key not configured" }
    }

    const response = await fetch(
      `${apiUrl}/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${key}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      return { success: false, error: `Approval failed: ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    console.error("[Pi Payment Approval] Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Complete payment via Pi Platform API (server-side only)
 */
export async function completePaymentWithPiAPI(
  paymentId: string,
  txid: string,
  apiKey?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = apiKey || process.env.PI_API_KEY
    const apiUrl = process.env.PI_API_URL || "https://api.minepi.com"

    if (!key) {
      return { success: false, error: "API key not configured" }
    }

    const response = await fetch(
      `${apiUrl}/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
      }
    )

    if (!response.ok) {
      return { success: false, error: `Completion failed: ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    console.error("[Pi Payment Completion] Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Cancel payment via Pi Platform API (server-side only)
 */
export async function cancelPaymentWithPiAPI(
  paymentId: string,
  apiKey?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = apiKey || process.env.PI_API_KEY
    const apiUrl = process.env.PI_API_URL || "https://api.minepi.com"

    if (!key) {
      return { success: false, error: "API key not configured" }
    }

    const response = await fetch(
      `${apiUrl}/v2/payments/${paymentId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${key}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      return { success: false, error: `Cancellation failed: ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    console.error("[Pi Payment Cancellation] Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
