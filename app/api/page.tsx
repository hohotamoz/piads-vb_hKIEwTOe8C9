"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Key,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Code,
  Webhook,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiIntegrationService, type APIKey, availableIntegrations } from "@/lib/api-integration"

export default function APIPage() {
  const [activeTab, setActiveTab] = useState("keys")
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  if (!user || (user.role !== "developer" && user.role !== "admin" && user.role !== "store")) {
    router.push("/")
    return null
  }

  const handleGenerateKey = async () => {
    setIsGenerating(true)
    try {
      const newKey = await apiIntegrationService.generateAPIKey("My API Key", ["read", "write"])
      setApiKeys([...apiKeys, newKey])
    } catch (error) {
      console.error("[v0] Error generating API key:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
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
              <h1 className="text-xl font-bold text-slate-900">API Integration</h1>
              <p className="text-sm text-slate-500">Connect external apps</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white border border-slate-200 p-1">
            <TabsTrigger
              value="keys"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              API Keys
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Apps
            </TabsTrigger>
            <TabsTrigger
              value="webhooks"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Webhooks
            </TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-4">
            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">API Keys</h3>
                    <p className="text-sm text-slate-600">
                      Use API keys to authenticate requests to PiAds API endpoints. Keep your secret keys secure.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerateKey}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New API Key
                </>
              )}
            </Button>

            {apiKeys.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Key className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No API keys yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((apiKey) => (
                  <Card key={apiKey.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-slate-900 mb-1">{apiKey.name}</h3>
                          <p className="text-xs text-slate-500">Created {apiKey.createdAt.toLocaleDateString()}</p>
                        </div>
                        <Badge
                          variant={apiKey.status === "active" ? "default" : "secondary"}
                          className={
                            apiKey.status === "active"
                              ? "bg-emerald-100 text-emerald-700 border-0"
                              : "bg-slate-100 text-slate-700 border-0"
                          }
                        >
                          {apiKey.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-slate-500">Public Key</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="flex-1 text-xs bg-slate-100 p-2 rounded border border-slate-200 font-mono">
                              {apiKey.key}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyKey(apiKey.key)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-slate-500">Secret Key</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="flex-1 text-xs bg-slate-100 p-2 rounded border border-slate-200 font-mono">
                              {showSecrets[apiKey.id] ? apiKey.secret : "••••••••••••••••••••••••••••••••"}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleSecretVisibility(apiKey.id)}
                              className="h-8 w-8 p-0"
                            >
                              {showSecrets[apiKey.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyKey(apiKey.secret)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center space-x-2">
                          {apiKey.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 text-xs text-red-600">
                          <Trash2 className="w-3 h-3 mr-1" />
                          Revoke
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <Card className="border-0 shadow-sm bg-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Available Integrations</h3>
                    <p className="text-sm text-slate-600">
                      Connect your PiAds account with external Pi Network apps and services.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {availableIntegrations.map((app) => (
                <Card key={app.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <img src={app.logo || "/placeholder.svg"} alt={app.name} className="w-8 h-8 rounded" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-medium text-slate-900">{app.name}</h3>
                          {app.status === "connected" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-2" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-300 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{app.description}</p>
                        <Badge variant="secondary" className="text-xs mb-3">
                          {app.category}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          {app.status === "connected" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs border-slate-200 bg-transparent"
                              >
                                Configure
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 text-xs text-red-600">
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card className="border-0 shadow-sm bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Webhook className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Webhook Configuration</h3>
                    <p className="text-sm text-slate-600">
                      Receive real-time notifications when events occur in your PiAds account.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Webhook URL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="webhookUrl">Endpoint URL</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://your-app.com/webhooks/piads"
                    className="mt-2 border-slate-200"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Events to Subscribe</Label>
                  <div className="space-y-2">
                    {["ad.created", "ad.updated", "payment.received", "review.added", "report.submitted"].map(
                      (event) => (
                        <div key={event} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded">
                          <input type="checkbox" id={event} className="rounded" />
                          <Label htmlFor={event} className="text-sm cursor-pointer flex-1">
                            {event}
                          </Label>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
                  Save Webhook Configuration
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Recent Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Webhook className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No webhook deliveries yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
