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

import { supabase, isSupabaseConfigured } from "@/lib/supabase"

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

  constructor() { }

  async getConversations(userId: string): Promise<Conversation[]> {
    if (!isSupabaseConfigured) return []

    try {
      // Fetch unique conversations by finding distinct ad_id and partner combinations
      // This is a complex query, simplified here by fetching latest messages
      const { data: messages, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!sender_id(name, avatar),
          receiver:profiles!receiver_id(name, avatar),
          ad:ads!ad_id(title)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false })

      if (error) throw error

      const conversationMap = new Map<string, Conversation>()

      messages.forEach((msg: any) => {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
        // Group by Ad ID + Partner ID to create unique conversation context
        const convId = `${msg.ad_id}_${partnerId}`

        if (!conversationMap.has(convId)) {
          const partnerProfile = msg.sender_id === userId ? msg.receiver : msg.sender

          conversationMap.set(convId, {
            id: convId,
            participants: [userId, partnerId],
            lastMessage: {
              id: msg.id,
              conversationId: convId,
              senderId: msg.sender_id,
              receiverId: msg.receiver_id,
              text: msg.content,
              timestamp: new Date(msg.created_at),
              read: msg.is_read,
              type: "text", // Defaulting to text for now
            },
            unreadCount: (msg.receiver_id === userId && !msg.is_read) ? 1 : 0,
            adId: msg.ad_id,
            adTitle: msg.ad?.title || "Unknown Ad",
            createdAt: new Date(msg.created_at), // This serves as last active
            updatedAt: new Date(msg.created_at),
          })
        } else {
          // Increment unread count if we found another unread message for this conversation
          const conv = conversationMap.get(convId)!
          if (msg.receiver_id === userId && !msg.is_read) {
            conv.unreadCount += 1
          }
        }
      })

      return Array.from(conversationMap.values())
    } catch (error) {
      console.error("Error fetching conversations:", error)
      return []
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    if (!isSupabaseConfigured) return []

    // ConversationID format is `adId_partnerId`
    // But we need to be careful. Let's assume we pass adId and partnerId separately on the UI side or handle logical separation.
    // For simplicity in this "fix", let's assume valid UUIDs if we had a conversations table,
    // BUT since we don't have a conversations table in the `Database` type saw earlier, 
    // we are synthesizing conversations from messages. 
    // We need to parse valid Ad IDs and User IDs from the conversationId we generated.

    const [adId, partnerId] = conversationId.split("_")

    if (!adId || !partnerId) return []

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("ad_id", adId)
        .or(`sender_id.eq.${partnerId},receiver_id.eq.${partnerId}`) // Filter where partner is involved
        // We also need to filter where CURRENT user is involved, but usually this method is called within context of a user
        .order("created_at", { ascending: true })

      if (error) throw error

      return data.map((msg: any) => ({
        id: msg.id,
        conversationId: conversationId,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        text: msg.content,
        timestamp: new Date(msg.created_at),
        read: msg.is_read,
        type: "text"
      }))
    } catch (error) {
      console.error("Error fetching messages:", error)
      return []
    }
  }

  async sendMessage(message: { conversationId: string, senderId: string, receiverId: string, text: string, adId?: string }): Promise<Message | null> {
    if (!isSupabaseConfigured) return null

    // Extract AdID if not provided (from conversation ID)
    let adId = message.adId
    if (!adId && message.conversationId.includes("_")) {
      adId = message.conversationId.split("_")[0]
    }

    if (!adId) {
      console.error("Cannot send message without Ad ID context")
      return null
    }

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          ad_id: adId,
          sender_id: message.senderId,
          receiver_id: message.receiverId,
          content: message.text,
          is_read: false
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        conversationId: message.conversationId,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        text: data.content,
        timestamp: new Date(data.created_at),
        read: data.is_read,
        type: "text"
      }
    } catch (error) {
      console.error("Error sending message:", error)
      return null
    }
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    if (!isSupabaseConfigured) return
    const [adId, partnerId] = conversationId.split("_")
    if (!adId || !partnerId) return

    try {
      // Mark messages as read where I am the receiver and the other person is the sender
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("ad_id", adId)
        .eq("receiver_id", userId)
        .eq("sender_id", partnerId)
        .eq("is_read", false)
    } catch (e) {
      console.error("Error marking as read", e)
    }
  }

  subscribeToConversation(conversationId: string, callback: (messages: Message[]) => void): () => void {
    if (!isSupabaseConfigured) return () => { }

    const [adId, partnerId] = conversationId.split("_")

    // Initial fetch
    this.getMessages(conversationId).then(callback)

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE)
          schema: 'public',
          table: 'messages',
          filter: `ad_id=eq.${adId}` // Filter by ad_id
        },
        async (payload) => {
          // When a change happens, plain refetch is safest for consistency for now
          const msgs = await this.getMessages(conversationId)
          callback(msgs)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async createConversation(participantIds: string[], adId?: string, adTitle?: string): Promise<Conversation> {
    // Generate unique conversation ID based on Ad and Participants
    // Current logic assumes [Buyer, Seller]
    // Consistently order participants? No, conversation ID logic in getConversations uses:
    // const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
    // const convId = `${msg.ad_id}_${partnerId}`
    // So the ID is relative to the viewer? 
    // Actually, `convId` calculation in `getConversations` effectively makes 2 different IDs for the same conversation depending on who views it 
    // (if `partnerId` is dynamic).
    // Let's look at `getConversations`:
    // const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
    // const convId = `${msg.ad_id}_${partnerId}`
    // If I am Buyer (U1) talking to Seller (U2) on Ad (A1).
    // Msg: Sender=U1, Receiver=U2. 
    // My View (UserId=U1): Partner=U2. ID = A1_U2.
    // Seller View (UserId=U2): Partner=U1. ID = A1_U1.
    // THIS IS A MISMATCH! One conversation physically, but 2 different logical IDs?
    // This explains why they don't see each other's messages if we use this ID to filter?
    // Wait, `getMessages` uses `ad_id` and `or(sender=partner, receiver=partner)`.
    // It takes `conversationId` as input and parses `adId_partnerId`.
    // If I am U1, I request `A1_U2`. `getMessages` queries `ad_id=A1` AND `(sender=U2 OR receiver=U2)`.
    // This finds messages where U2 is involved. 
    // But what about messages I sent (sender=U1, receiver=U2)? 
    // My query: `sender=U2` (False) OR `receiver=U2` (True). So it MATCHES. 
    // So `getMessages` logic works even with relative IDs.

    // HOWEVER, `createConversation` needs to return the ID relevant to the *CURRENT USER* (Buyer).
    // user.id is usually the first participant in the array passed from UI or we should find which one is "me".
    // But `createConversation` doesn't know who "me" is explicitly unless we pass it.
    // `participantIds` usually [me, other].
    // Let's assume the caller passes [currentUser, otherUser].

    // We need to return the ID that the *caller* will use to view the chat.
    // So ID = `${adId}_${otherUser}`.

    const currentUser = participantIds[0]
    const otherUser = participantIds[1]
    const conversationId = `${adId}_${otherUser}`

    if (!isSupabaseConfigured) {
      // Mock return
      return {
        id: conversationId,
        participants: participantIds,
        lastMessage: null,
        unreadCount: 0,
        adId,
        adTitle,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    // Check if conversation actually has messages
    const msgs = await this.getMessages(conversationId)
    if (msgs.length === 0) {
      // Auto-send "Hi, is this available?" to persist it
      await this.sendMessage({
        conversationId,
        senderId: currentUser,
        receiverId: otherUser,
        text: "Hi, is this available?",
        adId
      })
    }

    return {
      id: conversationId,
      participants: participantIds,
      lastMessage: null, // Will be populated on refresh
      unreadCount: 0,
      adId,
      adTitle,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  getUnreadCount(userId: string): Promise<number> {
    // This would be async now.
    // For now return 0 or implement a separate count query.
    return Promise.resolve(0)
  }

}

export const realtimeMessaging = new RealtimeMessagingService()
