"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Wallet, ArrowUpRight, Clock, Loader2, Zap } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { piPaymentService, type PiPaymentResponse } from "@/lib/pi-payment"
import { usePiAuth } from "@/contexts/pi-auth-context"
import Link from "next/link"

export default function WalletPage() {
  const [transactions, setTransactions] = useState<PiPaymentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isLoading: authLoading } = useAuth()
  const { userData, piAccessToken, reinitialize, isAuthenticated } = usePiAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchTransactions = async () => {
      try {
        const history = await piPaymentService.getPaymentHistory(user.id)
        setTransactions(history)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user, router, authLoading])

  if (authLoading || (isLoading && !transactions.length)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-600" />
          </div>
          <p className="text-sm text-slate-600 font-medium">Loading wallet...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const piBalance = userData?.credits_balance || 0

  const getTransactionLabel = (metadata?: PiPaymentResponse["metadata"]) => {
    if (!metadata) return "Payment"
    switch (metadata.type) {
      case "subscription":
        return "Subscription"
      case "featured_ad":
        return "Featured Ad"
      case "promoted_ad":
        return "Promoted Ad"
      case "purchase":
        return "Purchase"
      default:
        return "Payment"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Pi Wallet</h1>
              <p className="text-sm text-slate-500">Secure Pi Network payments</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Wallet Balance - Pi SDK */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/80">Pi Network Balance</p>
                <h2 className="text-3xl font-bold text-white">{piBalance.toFixed(2)} π</h2>
              </div>
            </div>
            {userData && isAuthenticated ? (
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-white/60 mb-1">Connected Account</p>
                <p className="text-sm text-white font-mono">@{userData.username}</p>
              </div>
            ) : (
              <Button
                onClick={() => reinitialize()}
                className="w-full bg-white text-emerald-600 hover:bg-white/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Connect Pi Network
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/promote">
            <Button variant="outline" className="w-full h-auto py-4 flex-col space-y-2 border-slate-200 bg-white">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium">Promote Ad</span>
            </Button>
          </Link>
          <Link href="/subscription">
            <Button variant="outline" className="w-full h-auto py-4 flex-col space-y-2 border-slate-200 bg-white">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Subscribe</span>
            </Button>
          </Link>
        </div>

        {/* Transaction History */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Transaction History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
                <p className="text-sm text-slate-500 mt-3">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No transactions yet</p>
                <p className="text-xs text-slate-400 mt-1">Your payment history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.identifier}
                    className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.status === "completed" ? "bg-emerald-50" : "bg-slate-100"
                        }`}
                      >
                        <ArrowUpRight
                          className={`w-5 h-5 ${tx.status === "completed" ? "text-emerald-600" : "text-slate-400"}`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{getTransactionLabel(tx.metadata)}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(tx.timestamp).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">-{tx.amount} π</p>
                      <Badge
                        variant={tx.status === "completed" ? "default" : "secondary"}
                        className={`text-xs border-0 ${
                          tx.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : tx.status === "cancelled"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Info */}
        {isAuthenticated && (
          <Card className="mt-6 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-900">Secure Pi Network Payments</p>
                  <p className="text-xs text-blue-700">
                    All transactions are processed through the official Pi Network SDK. Your payments are secure and go
                    directly to the app owner's Pi wallet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
