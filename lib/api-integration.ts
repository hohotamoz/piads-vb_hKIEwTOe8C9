export interface APIKey {
  id: string
  name: string
  key: string
  secret: string
  permissions: string[]
  createdAt: Date
  lastUsed?: Date
  status: "active" | "inactive" | "revoked"
}

export interface IntegrationApp {
  id: string
  name: string
  description: string
  logo: string
  category: "payment" | "store" | "service" | "analytics"
  status: "connected" | "disconnected"
  apiKey?: string
  webhookUrl?: string
}

export interface WebhookEvent {
  id: string
  event: string
  payload: any
  timestamp: Date
  status: "pending" | "delivered" | "failed"
  retries: number
}

export const availableIntegrations: IntegrationApp[] = [
  {
    id: "pi-payments",
    name: "Pi Payments",
    description: "Accept Pi cryptocurrency payments",
    logo: "/placeholder.svg?height=80&width=80",
    category: "payment",
    status: "connected",
  },
  {
    id: "pi-store",
    name: "Pi Store",
    description: "Sync products with Pi Network Store",
    logo: "/placeholder.svg?height=80&width=80",
    category: "store",
    status: "disconnected",
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description: "Advanced analytics and insights",
    logo: "/placeholder.svg?height=80&width=80",
    category: "analytics",
    status: "disconnected",
  },
]

class APIIntegrationService {
  async generateAPIKey(name: string, permissions: string[]): Promise<APIKey> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const key = `pk_${Math.random().toString(36).substr(2, 32)}`
    const secret = `sk_${Math.random().toString(36).substr(2, 32)}`

    return {
      id: `key_${Date.now()}`,
      name,
      key,
      secret,
      permissions,
      createdAt: new Date(),
      status: "active",
    }
  }

  async revokeAPIKey(keyId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return true
  }

  async testAPIConnection(apiKey: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }

  async sendWebhook(event: string, payload: any, webhookUrl: string): Promise<WebhookEvent> {
    console.log("[v0] Sending webhook:", { event, payload, webhookUrl })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      id: `webhook_${Date.now()}`,
      event,
      payload,
      timestamp: new Date(),
      status: "delivered",
      retries: 0,
    }
  }

  async getIntegrationStatus(appId: string): Promise<"connected" | "disconnected"> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const app = availableIntegrations.find((a) => a.id === appId)
    return app?.status || "disconnected"
  }

  async connectIntegration(appId: string, config: any): Promise<boolean> {
    console.log("[v0] Connecting integration:", appId, config)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return true
  }

  async disconnectIntegration(appId: string): Promise<boolean> {
    console.log("[v0] Disconnecting integration:", appId)
    await new Promise((resolve) => setTimeout(resolve, 500))
    return true
  }
}

export const apiIntegrationService = new APIIntegrationService()
