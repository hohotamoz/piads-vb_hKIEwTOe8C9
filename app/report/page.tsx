"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"

const reportReasons = [
  { id: "scam", label: "Scam or Fraud", description: "This ad is trying to scam people" },
  { id: "misleading", label: "Misleading Information", description: "False or misleading product details" },
  { id: "inappropriate", label: "Inappropriate Content", description: "Contains offensive material" },
  { id: "spam", label: "Spam", description: "Repeated or irrelevant content" },
  { id: "counterfeit", label: "Counterfeit Product", description: "Selling fake or copied items" },
  { id: "other", label: "Other", description: "Something else" },
]

export default function ReportPage() {
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    router.push("/auth/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReason) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    alert("Report submitted successfully. We'll review it within 24 hours.")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Report Ad</h1>
              <p className="text-sm text-slate-500">Help us keep PiAds safe</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Warning Card */}
        <Card className="mb-6 border-0 shadow-sm bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-slate-900 mb-1">Report Responsibly</h3>
                <p className="text-sm text-slate-600">
                  False reports may result in account suspension. Only report ads that violate our policies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6 border-0 shadow-sm">
            <CardContent className="p-4">
              <Label className="text-base font-semibold text-slate-900 mb-4 block">
                Why are you reporting this ad?
              </Label>

              <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="space-y-3">
                {reportReasons.map((reason) => (
                  <div
                    key={reason.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <RadioGroupItem value={reason.id} id={reason.id} className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor={reason.id} className="font-medium text-slate-900 cursor-pointer">
                        {reason.label}
                      </Label>
                      <p className="text-sm text-slate-500">{reason.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="mb-6 border-0 shadow-sm">
            <CardContent className="p-4">
              <Label htmlFor="description" className="text-base font-semibold text-slate-900 mb-3 block">
                Additional Details (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Please provide more information about this issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 border-slate-200"
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={!selectedReason || isSubmitting}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white h-12"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting Report...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
