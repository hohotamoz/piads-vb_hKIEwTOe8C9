"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Plug,
  Check,
  Settings,
  Zap,
  Store,
  CreditCard,
  BarChart3,
  ExternalLink,
  Key,
  Webhook,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { availableIntegrations, apiIntegrationService } from "@/lib/api-integration"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "payment":
      return CreditCard
    case "store":
      return Store
    case "analytics":
      return BarChart3
    default:
      return Zap
  }
}

export default function IntegrationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [integrations, setIntegrations] = useState(availableIntegrations)

  if (!user) {
    router.push("/auth/login")
    return null
  }

  const handleConnect = async (appId: string) => {
    setConnecting(true)
    try {
      await apiIntegrationService.connectIntegration(appId, {})
      setIntegrations((prev) => prev.map((app) => (app.id === appId ? { ...app, status: "connected" } : app)))
    } catch (error) {
      console.error("Failed to connect:", error)
    } finally {
      setConnecting(false)
      setSelectedApp(null)
    }
  }

  const handleDisconnect = async (appId: string) => {
    try {
      await apiIntegrationService.disconnectIntegration(appId)
      setIntegrations((prev) => prev.map((app) => (app.id === appId ? { ...app, status: "disconnected" } : app)))
    } catch (error) {
      console.error("Failed to disconnect:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Integrations</h1>
                <p className="text-sm text-muted-foreground">Connect your apps and services</p>
              </div>
            </div>
            <Link href="/integrations/api-keys">
              <Button size="sm" variant="outline">
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        <Card className="mb-6 border-border bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Plug className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Connect Your Pi Apps</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Integrate your Pi Network stores, payment services, and apps to automatically sync ads, products, and
                  services with PiAds platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Available Integrations</h2>
          <Badge variant="secondary">{integrations.filter((app) => app.status === "connected").length} Connected</Badge>
        </div>

        <div className="space-y-3">
          {integrations.map((app) => {
            const CategoryIcon = getCategoryIcon(app.category)
            const isConnected = app.status === "connected"

            return (
              <Card key={app.id} className="border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                      <CategoryIcon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{app.name}</h3>
                          <p className="text-xs text-muted-foreground">{app.description}</p>
                        </div>
                        {isConnected && (
                          <Badge className="bg-success/10 text-success border-0 ml-2">
                            <Check className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        {isConnected ? (
                          <>
                            <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent">
                              <Settings className="w-3 h-3 mr-1" />
                              Configure
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 bg-transparent"
                              onClick={() => handleDisconnect(app.id)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-primary"
                                onClick={() => setSelectedApp(app.id)}
                              >
                                <Plug className="w-3 h-3 mr-1" />
                                Connect
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Connect {app.name}</DialogTitle>
                                <DialogDescription>
                                  Configure your integration settings to connect with {app.name}.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="apiKey">API Key</Label>
                                  <Input id="apiKey" placeholder="Enter your API key" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                                  <Input id="webhookUrl" placeholder="https://your-app.com/webhook" />
                                </div>
                                <div className="flex items-start space-x-2 p-3 bg-muted rounded-lg">
                                  <Webhook className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    Webhooks allow real-time synchronization between {app.name} and PiAds platform.
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  className="flex-1 bg-primary"
                                  onClick={() => handleConnect(app.id)}
                                  disabled={connecting}
                                >
                                  {connecting ? "Connecting..." : "Connect Integration"}
                                </Button>
                                <Button variant="outline" onClick={() => setSelectedApp(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mt-6 border-border bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Developer Resources</CardTitle>
            <CardDescription className="text-xs">Build your own integration with PiAds API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/integrations/api-keys">
              <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent">
                <Key className="w-4 h-4 mr-3 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-sm">API Keys</p>
                  <p className="text-xs text-muted-foreground">Manage your API credentials</p>
                </div>
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start h-auto py-3 bg-transparent">
              <ExternalLink className="w-4 h-4 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">Documentation</p>
                <p className="text-xs text-muted-foreground">Read the API documentation</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
