"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Minus, Plus, ShoppingCart, Coins } from "lucide-react"
import { toast } from "sonner"
import { purchaseSystem } from "@/lib/purchase-system"
import { usePiAuth } from "@/contexts/pi-auth-context"
import type { Ad } from "@/lib/types"

interface PurchaseDialogProps {
  ad: Ad
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function PurchaseDialog({ ad, isOpen, onClose, userId }: PurchaseDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { isAuthenticated, reinitialize } = usePiAuth()

  const pricePerUnit = typeof ad.price === 'string'
    ? parseFloat(ad.price.replace(/[^0-9.]/g, ""))
    : Number(ad.price)
  const totalPrice = pricePerUnit * quantity
  const maxStock = ad.stock || 10

  const handlePurchase = async () => {
    if (!deliveryAddress || !phoneNumber) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsProcessing(true)

    try {
      // Ensure Pi authentication
      if (!isAuthenticated) {
        toast.info("Connecting to Pi Network...")
        try {
          await reinitialize()
        } catch (error) {
          toast.error("Please authenticate with Pi Network to continue")
          setIsProcessing(false)
          return
        }
      }

      // Create purchase with Pi payment
      toast.info("Initiating Pi payment...")
      const purchase = await purchaseSystem.createPurchase(
        ad.id,
        userId,
        ad.userId,
        quantity,
        pricePerUnit,
        deliveryAddress,
        phoneNumber
      )

      if (purchase) {
        toast.success("Purchase completed successfully! 🎉")
        onClose()

        // Reset form
        setQuantity(1)
        setDeliveryAddress("")
        setPhoneNumber("")
      } else {
        toast.error("Failed to create purchase. Please try again.")
      }
    } catch (error: any) {
      console.error("Purchase error:", error)
      const errorMessage = error?.message || "An error occurred. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            Purchase Product
          </DialogTitle>
          <DialogDescription>
            Complete your purchase with Pi cryptocurrency
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Info */}
          <div className="bg-slate-50 rounded-lg p-3">
            <h3 className="font-semibold text-slate-900">{ad.title}</h3>
            <p className="text-sm text-slate-600 mt-1">
              Price per unit: <span className="font-bold text-emerald-600">{ad.price} π</span>
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10 rounded-xl"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(maxStock, parseInt(e.target.value) || 1)))}
                className="text-center font-bold text-lg"
                min="1"
                max={maxStock}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                disabled={quantity >= maxStock}
                className="h-10 w-10 rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500">Available stock: {maxStock}</p>
          </div>

          {/* Delivery Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Input
              id="address"
              placeholder="Enter your full delivery address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Your contact number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">Total Amount:</span>
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-yellow-500" />
                <span className="text-2xl font-bold text-emerald-600">{totalPrice.toFixed(2)} π</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-right">Payment via Pi Network</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-xl bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={isProcessing || !deliveryAddress || !phoneNumber}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing Payment...
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 mr-2" />
                Pay with Pi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
