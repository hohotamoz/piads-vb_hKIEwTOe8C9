export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  text: string
  timestamp: Date
  read: boolean
  type?: "text" | "image" | "emoji"
  imageUrl?: string
  attachments?: {
    type: "image" | "file"
    url: string
    name: string
  }[]
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage: Message | null
  unreadCount: number
  adId?: string
  adTitle?: string
  createdAt: Date
  updatedAt: Date
}

class RealtimeMessagingService {
  private messages: Map<string, Message[]> = new Map()
  private conversations: Map<string, Conversation> = new Map()
  private listeners: Map<string, Set<(messages: Message[]) => void>> = new Map()

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
      this.cleanupDemoData()
    }
  }

  private cleanupDemoData() {
    // Remove any demo conversations or messages
    const conversations = Array.from(this.conversations.values())
    const hasDemo = conversations.some(conv => 
      conv.participants.some(p => p.includes("demo") || p.includes("user-demo"))
    )
    
    if (hasDemo) {
      // Clear all demo data
      this.conversations = new Map(
        Array.from(this.conversations.entries()).filter(([_, conv]) => 
          !conv.participants.some(p => p.includes("demo") || p.includes("user-demo"))
        )
      )
      this.saveToStorage()
    }
  }

  private loadFromStorage() {
    const stored = localStorage.getItem("piads_messages")
    if (stored) {
      try {
        const data = JSON.parse(stored)
        this.messages = new Map(Object.entries(data.messages || {}))
        this.conversations = new Map(
          Object.entries(data.conversations || {}).map(([key, value]: [string, any]) => [
            key,
            {
              ...value,
              createdAt: new Date(value.createdAt),
              updatedAt: new Date(value.updatedAt),
              lastMessage: value.lastMessage
                ? {
                    ...value.lastMessage,
                    timestamp: new Date(value.lastMessage.timestamp),
                  }
                : null,
            },
          ]),
        )
      } catch (error) {
        console.error("Failed to load messages from storage:", error)
      }
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return

    const data = {
      messages: Object.fromEntries(this.messages),
      conversations: Object.fromEntries(this.conversations),
    }
    localStorage.setItem("piads_messages", JSON.stringify(data))
  }

  getConversations(userId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter((conv) => conv.participants.includes(userId))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  getMessages(conversationId: string): Message[] {
    return this.messages.get(conversationId) || []
  }

  sendMessage(message: Omit<Message, "id" | "timestamp" | "read">): Message {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    }

    const conversationMessages = this.messages.get(message.conversationId) || []
    conversationMessages.push(newMessage)
    this.messages.set(message.conversationId, conversationMessages)

    const conversation = this.conversations.get(message.conversationId)
    if (conversation) {
      conversation.lastMessage = newMessage
      conversation.updatedAt = new Date()
      // Only increase unread for receiver, not sender
      if (message.receiverId !== message.senderId) {
        conversation.unreadCount += 1
      }
      this.conversations.set(message.conversationId, conversation)
    }

    this.saveToStorage()
    this.notifyListeners(message.conversationId)

    return newMessage
  }

  async sendImageMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    imageFile: File
  ): Promise<Message | null> {
    try {
      // Convert image to base64
      const reader = new FileReader()
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })

      return this.sendMessage({
        conversationId,
        senderId,
        receiverId,
        text: "Sent an image",
        type: "image",
        imageUrl: imageDataUrl,
      })
    } catch (error) {
      console.error("Failed to send image:", error)
      return null
    }
  }

  markAsRead(conversationId: string, userId: string): void {
    const messages = this.messages.get(conversationId) || []
    messages.forEach((msg) => {
      if (msg.receiverId === userId && !msg.read) {
        msg.read = true
      }
    })

    const conversation = this.conversations.get(conversationId)
    if (conversation) {
      conversation.unreadCount = 0
      this.conversations.set(conversationId, conversation)
    }

    this.saveToStorage()
    this.notifyListeners(conversationId)
  }

  createConversation(participantIds: string[], adId?: string, adTitle?: string): Conversation {
    // Check for existing conversation between same participants
    const existingConv = Array.from(this.conversations.values()).find(
      (conv) =>
        conv.participants.length === participantIds.length &&
        conv.participants.every((p) => participantIds.includes(p)) &&
        (!adId || conv.adId === adId)
    )

    if (existingConv) return existingConv

    const uniqueParticipants = Array.from(new Set(participantIds)).sort()
    
    const newConversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants: uniqueParticipants,
      lastMessage: null,
      unreadCount: 0,
      adId,
      adTitle,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.conversations.set(newConversation.id, newConversation)
    this.messages.set(newConversation.id, [])
    this.saveToStorage()

    return newConversation
  }

  subscribeToConversation(conversationId: string, callback: (messages: Message[]) => void): () => void {
    if (!this.listeners.has(conversationId)) {
      this.listeners.set(conversationId, new Set())
    }
    this.listeners.get(conversationId)!.add(callback)

    callback(this.getMessages(conversationId))

    return () => {
      const listeners = this.listeners.get(conversationId)
      if (listeners) {
        listeners.delete(callback)
      }
    }
  }

  private notifyListeners(conversationId: string): void {
    const listeners = this.listeners.get(conversationId)
    if (listeners) {
      const messages = this.getMessages(conversationId)
      listeners.forEach((callback) => callback(messages))
    }
  }

  deleteConversation(conversationId: string): void {
    this.conversations.delete(conversationId)
    this.messages.delete(conversationId)
    this.listeners.delete(conversationId)
    this.saveToStorage()
  }

  getUnreadCount(userId: string): number {
    return Array.from(this.conversations.values())
      .filter((conv) => conv.participants.includes(userId))
      .reduce((sum, conv) => sum + conv.unreadCount, 0)
  }
}

export const realtimeMessaging = new RealtimeMessagingService()
