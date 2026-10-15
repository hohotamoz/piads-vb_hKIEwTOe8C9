import { isPiSandboxMode } from "./system-config"

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound?: (payment: any) => void,
      ) => Promise<{
        accessToken: string
        user: {
          uid: string
          username: string
        }
      }>
      createPayment: (
        paymentData: {
          amount: number
          memo: string
          metadata: object
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void
          onReadyForServerCompletion: (paymentId: string, txid: string) => void
          onCancel: (paymentId: string) => void
          onError: (error: Error, payment?: any) => void
        },
      ) => void
      openShareDialog: (title: string, message: string) => void
    }
  }
}

export interface PiUser {
  uid: string
  username: string
  accessToken: string
}

export interface PiPaymentData {
  amount: number
  memo: string
  metadata: {
    type: "featured_ad" | "promoted_ad" | "subscription" | "purchase"
    adId?: string
    userId: string
    duration?: number
    planId?: string
  }
}

export interface PiPaymentResult {
  paymentId: string
  txid?: string
  status: "completed" | "cancelled" | "error"
  error?: string
}

class PiSDKService {
  private initialized = false
  private user: PiUser | null = null
  private sandbox = false

  async initialize(sandbox = isPiSandboxMode()): Promise<void> {
    if (this.initialized) return

    this.sandbox = sandbox

    if (typeof window === "undefined") {
      console.warn("Pi SDK can only be initialized in browser environment")
      return
    }

    return new Promise((resolve, reject) => {
      if (window.Pi) {
        window.Pi.init({ version: "2.0", sandbox })
        this.initialized = true
        resolve()
      } else {
        const script = document.createElement("script")
        script.src = "https://sdk.minepi.com/pi-sdk.js"
        script.onload = () => {
          if (window.Pi) {
            window.Pi.init({ version: "2.0", sandbox })
            this.initialized = true
            resolve()
          } else {
            reject(new Error("Failed to load Pi SDK"))
          }
        }
        script.onerror = () => reject(new Error("Failed to load Pi SDK script"))
        document.head.appendChild(script)
      }
    })
  }

  async authenticate(): Promise<PiUser> {
    if (!this.initialized || !window.Pi) {
      throw new Error("Pi SDK not initialized. Call initialize() first.")
    }

    try {
      const scopes = ["username", "payments"]
      const auth = await window.Pi.authenticate(scopes, (payment) => {
        console.log("[Pi SDK] Incomplete payment found:", payment)
      })

      this.user = {
        uid: auth.user.uid,
        username: auth.user.username,
        accessToken: auth.accessToken,
      }

      return this.user
    } catch (error) {
      console.error("[Pi SDK] Authentication failed:", error)
      throw error
    }
  }

  async createPayment(paymentData: PiPaymentData): Promise<PiPaymentResult> {
    if (!this.initialized || !window.Pi) {
      throw new Error("Pi SDK not initialized")
    }

    if (!this.user) {
      throw new Error("User not authenticated")
    }

    console.log("[Pi SDK] Creating payment:", paymentData)

    return new Promise((resolve, reject) => {
      window.Pi!.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId) => {
          console.log("[Pi SDK] Payment ready for server approval:", paymentId)
          try {
            const approved = await this.approvePayment(paymentId)
            if (!approved) {
              reject(new Error("Payment approval failed"))
            }
          } catch (error) {
            console.error("[Pi SDK] Approval error:", error)
            reject(error)
          }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          console.log("[Pi SDK] Payment ready for server completion:", paymentId, txid)
          try {
            const completed = await this.completePayment(paymentId, txid)
            if (completed) {
              resolve({
                paymentId,
                txid,
                status: "completed",
              })
            } else {
              reject(new Error("Payment completion failed"))
            }
          } catch (error) {
            console.error("[Pi SDK] Completion error:", error)
            reject(error)
          }
        },
        onCancel: (paymentId) => {
          console.log("[Pi SDK] Payment cancelled:", paymentId)
          resolve({
            paymentId,
            status: "cancelled",
          })
        },
        onError: (error, payment) => {
          console.error("[Pi SDK] Payment error:", error, payment)
          reject(error)
        },
      })
    })
  }

  private async approvePayment(paymentId: string): Promise<boolean> {
    try {
      const response = await fetch("/api/payments/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentId }),
      })

      return response.ok
    } catch (error) {
      console.error("[Pi SDK] Payment approval error:", error)
      return false
    }
  }

  private async completePayment(paymentId: string, txid: string): Promise<boolean> {
    try {
      const response = await fetch("/api/payments/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentId, txid }),
      })

      return response.ok
    } catch (error) {
      console.error("[Pi SDK] Payment completion error:", error)
      return false
    }
  }

  getUser(): PiUser | null {
    return this.user
  }

  logout(): void {
    this.user = null
  }

  isAuthenticated(): boolean {
    return this.getUser() !== null
  }

  formatPiAmount(amount: number): string {
    return `${amount.toLocaleString()} π`
  }
}

export const piSDK = new PiSDKService()
