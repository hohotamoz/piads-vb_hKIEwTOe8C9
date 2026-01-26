/**
 * Pi Payment Verification Utilities
 * للتحقق من المدفوعات مع Pi Network API
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
 * التحقق من الدفع مع Pi Network API
 * هذه الدالة يجب استدعاؤها من Backend فقط
 */
export async function verifyPaymentWithPiAPI(
  paymentId: string,
  apiKey?: string
): Promise<PiPaymentVerificationResult> {
  try {
    const key = apiKey || process.env.PI_API_KEY

    if (!key) {
      return {
        verified: false,
        status: "failed",
        error: "API key not configured",
      }
    }

    // استدعاء Pi Network API للتحقق
    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}`,
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

    // فحص حالة الدفع
    const isCompleted = 
      data.status?.developer_completed === true ||
      (data.status?.transaction_verified === true && 
       data.status?.developer_approved === true)
    
    const isCancelled = data.status?.cancelled === true

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
 * الموافقة على الدفع (يجب استدعاؤها من Backend فقط بعد التحقق)
 */
export async function approvePaymentWithPiAPI(
  paymentId: string,
  apiKey?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = apiKey || process.env.PI_API_KEY

    if (!key) {
      return {
        success: false,
        error: "API key not configured",
      }
    }

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${key}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      return {
        success: false,
        error: `Approval failed: ${response.status}`,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("[Pi Payment Approval] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * إتمام الدفع (آخر خطوة بعد الموافقة)
 */
export async function completePaymentWithPiAPI(
  paymentId: string,
  txid: string,
  apiKey?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = apiKey || process.env.PI_API_KEY

    if (!key) {
      return {
        success: false,
        error: "API key not configured",
      }
    }

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
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
      return {
        success: false,
        error: `Completion failed: ${response.status}`,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("[Pi Payment Completion] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * إلغاء الدفع
 */
export async function cancelPaymentWithPiAPI(
  paymentId: string,
  apiKey?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = apiKey || process.env.PI_API_KEY

    if (!key) {
      return {
        success: false,
        error: "API key not configured",
      }
    }

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${key}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      return {
        success: false,
        error: `Cancellation failed: ${response.status}`,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("[Pi Payment Cancellation] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
