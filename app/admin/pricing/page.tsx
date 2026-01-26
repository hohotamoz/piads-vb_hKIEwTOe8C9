"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trash2, DollarSign, Edit, Check, X, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import {
  getPricingPlans,
  getSubscriptionPlans,
  updatePricingPlan,
  updateSubscriptionPlan,
  deletePricingPlan,
  type PricingPlan,
} from "@/lib/pi-payment"
import { Alert, AlertDescription } from "@/components/ui/alert"

const ADMIN_EMAIL = "hohotamoz200@gmail.com"

export default function AdminPricingPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAuth()
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<PricingPlan[]>([])
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<PricingPlan>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("promotion")

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase())) {
      router.push("/")
      return
    }

    if (user && isAdmin) {
      loadPlans()
    }
  }, [user, isAdmin, isLoading, router])

  const loadPlans = () => {
    setPricingPlans(getPricingPlans())
    setSubscriptionPlans(getSubscriptionPlans())
  }

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan.id)
    setEditValues(plan)
  }

  const handleSave = () => {
    if (!editingPlan || !editValues) return

    const isSubscription = subscriptionPlans.find((p) => p.id === editingPlan)

    const success = isSubscription
      ? updateSubscriptionPlan(editingPlan, editValues)
      : updatePricingPlan(editingPlan, editValues)

    if (success) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      loadPlans()
      setEditingPlan(null)
      setEditValues({})
    }
  }

  const handleCancel = () => {
    setEditingPlan(null)
    setEditValues({})
  }

  const handleDelete = (planId: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      deletePricingPlan(planId)
      loadPlans()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!user || !isAdmin || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Pricing Management</h1>
                <p className="text-sm text-slate-500">Manage subscription plans</p>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white border-0">Admin Only</Badge>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Success Alert */}
        {saveSuccess && (
          <Alert className="mb-4 border-emerald-200 bg-emerald-50">
            <Check className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              Pricing updated successfully! Changes are now live for all users.
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert */}
        <Alert className="mb-4 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            All pricing changes take effect immediately. User subscriptions remain active.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white border border-slate-200 p-1">
            <TabsTrigger
              value="promotion"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Promotion Plans
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Subscriptions
            </TabsTrigger>
          </TabsList>

          {/* Promotion Plans */}
          <TabsContent value="promotion" className="space-y-4">
            {pricingPlans.map((plan) => (
              <Card key={plan.id} className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {editingPlan === plan.id ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          className="h-8 border-slate-200 bg-transparent"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(plan)}
                          className="h-8 border-slate-200 bg-transparent"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(plan.id)}
                          className="h-8 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingPlan === plan.id ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`price-${plan.id}`} className="text-sm font-medium">
                          Price (π)
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id={`price-${plan.id}`}
                            type="number"
                            value={editValues.price || 0}
                            onChange={(e) => setEditValues({ ...editValues, price: Number.parseFloat(e.target.value) })}
                            className="pl-10 border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`duration-${plan.id}`} className="text-sm font-medium">
                          Duration (Days)
                        </Label>
                        <Input
                          id={`duration-${plan.id}`}
                          type="number"
                          value={editValues.duration || 0}
                          onChange={(e) => setEditValues({ ...editValues, duration: Number.parseInt(e.target.value) })}
                          className="border-slate-200 bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`name-${plan.id}`} className="text-sm font-medium">
                          Plan Name
                        </Label>
                        <Input
                          id={`name-${plan.id}`}
                          value={editValues.name || ""}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          className="border-slate-200 bg-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-emerald-600">{plan.price} π</span>
                        <span className="text-sm text-slate-500">for {plan.duration} days</span>
                      </div>

                      <div className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Subscription Plans */}
          <TabsContent value="subscription" className="space-y-4">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      {plan.popular && <Badge className="bg-emerald-600 text-white border-0 text-xs">Popular</Badge>}
                    </div>
                    {editingPlan === plan.id ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          className="h-8 border-slate-200 bg-transparent"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(plan)}
                        className="h-8 border-slate-200 bg-transparent"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingPlan === plan.id ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`price-${plan.id}`} className="text-sm font-medium">
                          Monthly Price (π)
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id={`price-${plan.id}`}
                            type="number"
                            value={editValues.price || 0}
                            onChange={(e) => setEditValues({ ...editValues, price: Number.parseFloat(e.target.value) })}
                            className="pl-10 border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`name-${plan.id}`} className="text-sm font-medium">
                          Plan Name
                        </Label>
                        <Input
                          id={`name-${plan.id}`}
                          value={editValues.name || ""}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          className="border-slate-200 bg-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-emerald-600">{plan.price} π</span>
                        <span className="text-sm text-slate-500">/month</span>
                      </div>

                      <div className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
