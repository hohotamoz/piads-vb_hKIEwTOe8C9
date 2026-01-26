import type { Purchase } from "./types"
import { piPaymentService } from "./pi-payment"

class PurchaseSystem {
  private purchases: Purchase[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    const stored = localStorage.getItem("piads_purchases")
    if (stored) {
      try {
        const data = JSON.parse(stored)
        this.purchases = data.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }))
      } catch (error) {
        console.error("Failed to load purchases:", error)
      }
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return
    localStorage.setItem("piads_purchases", JSON.stringify(this.purchases))
  }

  async createPurchase(
    adId: string,
    buyerId: string,
    sellerId: string,
    quantity: number,
    pricePerUnit: number,
    deliveryAddress?: string,
    phoneNumber?: string
  ): Promise<Purchase | null> {
    try {
      const totalPrice = quantity * pricePerUnit
      
      // Create Pi payment using Pi-Test (real Pi from user wallet)
      const payment = await piPaymentService.createPayment(
        totalPrice,
        `Purchase: Order #${Date.now()} - ${quantity} item(s)`,
        {
          type: "purchase",
          adId,
          userId: buyerId,
        }
      )

      if (!payment) {
        throw new Error("Failed to create Pi payment")
      }

      // Check payment status
      if (payment.status === "cancelled") {
        throw new Error("Payment was cancelled by user")
      }

      if (payment.status === "failed") {
        throw new Error("Payment failed. Please try again.")
      }

      // Only create purchase if payment completed
      const purchaseStatus = payment.status === "completed" ? "completed" : "pending"

      const purchase: Purchase = {
        id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adId,
        buyerId,
        sellerId,
        quantity,
        totalPrice,
        piPaymentId: payment.identifier,
        status: purchaseStatus,
        createdAt: new Date(),
        deliveryAddress,
        phoneNumber,
      }

      this.purchases.push(purchase)
      this.saveToStorage()

      return purchase
    } catch (error) {
      console.error("Failed to create purchase:", error)
      throw error
    }
  }

  completePurchase(purchaseId: string): boolean {
    const purchase = this.purchases.find(p => p.id === purchaseId)
    if (purchase) {
      purchase.status = "completed"
      this.saveToStorage()
      return true
    }
    return false
  }

  cancelPurchase(purchaseId: string): boolean {
    const purchase = this.purchases.find(p => p.id === purchaseId)
    if (purchase) {
      purchase.status = "cancelled"
      this.saveToStorage()
      return true
    }
    return false
  }

  getUserPurchases(userId: string): Purchase[] {
    return this.purchases
      .filter(p => p.buyerId === userId || p.sellerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getAdPurchases(adId: string): Purchase[] {
    return this.purchases
      .filter(p => p.adId === adId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getPurchaseById(purchaseId: string): Purchase | null {
    return this.purchases.find(p => p.id === purchaseId) || null
  }
}

export const purchaseSystem = new PurchaseSystem()
