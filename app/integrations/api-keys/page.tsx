"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Key, Copy, Eye, EyeOff, Plus, Trash2, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiIntegrationService, type APIKey } from "@/lib/api-integration"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function APIKeysPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [showKey, setShowKey] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newlyCreated, setNewlyCreated] = useState<APIKey | null>(null)

  if (!user) {
    router.push("/auth/login")
    return null
  }

  if (user.role !== "developer" && user.role !== "store" && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-sm text-muted-foreground mb-4">
              API key management is only available for developers and store owners.
            </p>
            <Link href="/profile">
              <Button>Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleCreateKey = async () => {
    if (!newKeyName || selectedPermissions.length === 0) return

    setCreating(true)
    try {
      const key = await apiIntegrationService.generateAPIKey(newKeyName, selectedPermissions)
      setApiKeys([...apiKeys, key])
      setNewlyCreated(key)
      setNewKeyName("")
      setSelectedPermissions([])
    } catch (error) {
      console.error("Failed to create API key:", error)
    } finally {
      setCreating(false)
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    try {
      await apiIntegrationService.revokeAPIKey(keyId)
      setApiKeys(apiKeys.map((k) => (k.id === keyId ? { ...k, status: "revoked" } : k)))
    } catch (error) {
      console.error("Failed to revoke key:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const permissions = [
    { id: "ads:read", label: "Read ads", description: "View ad listings" },
    { id: "ads:write", label: "Create ads", description: "Post new advertisements" },
    { id: "ads:delete", label: "Delete ads", description: "Remove advertisements" },
    { id: "users:read", label: "Read users", description: "View user information" },
    { id: "analytics:read", label: "Read analytics", description: "Access analytics data" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/integrations">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">API Keys</h1>
              <p className="text-sm text-muted-foreground">Manage your API credentials</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs leading-relaxed">
            Keep your API keys secure and never share them publicly. Each key provides programmatic access to your
            account and data.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your API Keys</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>Generate a new API key with specific permissions.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPermissions([...selectedPermissions, permission.id])
                          } else {
                            setSelectedPermissions(selectedPermissions.filter((p) => p !== permission.id))
                          }
                        }}
                      />
                      <div className="space-y-0.5">
                        <Label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                          {permission.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="w-full bg-primary" onClick={handleCreateKey} disabled={creating}>
                {creating ? "Creating..." : "Generate API Key"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {newlyCreated && (
          <Card className="mb-4 border-success bg-success/5">
            <CardHeader>
              <CardTitle className="text-base text-success">API Key Created Successfully!</CardTitle>
              <CardDescription className="text-xs">
                Make sure to copy your API key now. You won't be able to see it again!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">API Key</Label>
                <div className="flex items-center space-x-2">
                  <Input value={newlyCreated.key} readOnly className="font-mono text-xs" />
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(newlyCreated.key)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Secret Key</Label>
                <div className="flex items-center space-x-2">
                  <Input value={newlyCreated.secret} readOnly className="font-mono text-xs" />
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(newlyCreated.secret)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setNewlyCreated(null)}
              >
                I've Saved My Keys
              </Button>
            </CardContent>
          </Card>
        )}

        {apiKeys.length === 0 && !newlyCreated ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No API Keys Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first API key to start integrating with PiAds.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <Card key={key.id} className={`border-border ${key.status === "revoked" ? "opacity-50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-sm">{key.name}</h3>
                        <Badge
                          variant={key.status === "active" ? "default" : "secondary"}
                          className={
                            key.status === "active"
                              ? "bg-success/10 text-success border-0"
                              : "bg-destructive/10 text-destructive border-0"
                          }
                        >
                          {key.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {key.createdAt.toLocaleDateString()}
                        {key.lastUsed && ` • Last used ${key.lastUsed.toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={showKey === key.id ? key.key : "••••••••••••••••••••••••••••••••"}
                        readOnly
                        className="font-mono text-xs flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0"
                        onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                      >
                        {showKey === key.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {key.permissions.map((perm) => (
                      <Badge key={perm} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>

                  {key.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 bg-transparent"
                      onClick={() => handleRevokeKey(key.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Revoke Key
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
