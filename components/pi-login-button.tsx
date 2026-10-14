"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

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
    }
  }
}

export function PiLoginButton() {
  const [loading, setLoading] = useState(false)
  const [isPiBrowser, setIsPiBrowser] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkPi = () => {
      const ua = navigator.userAgent
      if (ua.includes("PiBrowser") || typeof window.Pi !== "undefined") {
        setIsPiBrowser(true)
      }
    }
    checkPi()
  }, [])

  const handlePiLogin = async () => {
    setLoading(true)
    try {
      if (!window.Pi) {
        throw new Error("Pi SDK not loaded")
      }

      // Initialize Pi SDK for Testnet (sandbox=false)
      window.Pi.init({ version: "2.0", sandbox: false })

      // Authenticate with Pi Network
      const scopes = ["username", "payments"]
      const onIncompletePaymentFound = (payment: any) => {
        console.log("Incomplete payment found", payment)
      }

      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound)

      // Send to backend for verification
      const response = await fetch("/api/auth/pi-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResult),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      router.push("/")
      router.refresh()
    } catch (error: any) {
      console.error("Pi Login Error:", error)
      alert(error.message || "Could not authenticate with Pi Network")
    } finally {
      setLoading(false)
    }
  }

  if (!isPiBrowser) return null

  return (
    <Button
      onClick={handlePiLogin}
      disabled={loading}
      className="w-full h-14 bg-gradient-to-r from-[#FBC02D] to-[#F57F17] hover:from-[#FBC02D]/90 hover:to-[#F57F17]/90 text-black font-bold rounded-full shadow-lg transition-all"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Authenticating...
        </>
      ) : (
        <>
          <span className="text-lg mr-2 font-black">π</span>
          Login with Pi Network
        </>
      )}
    </Button>
  )
}
