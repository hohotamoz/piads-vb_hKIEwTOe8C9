"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Send, MoreVertical, Phone, Video, Paperclip, ImageIcon, Smile, MessageCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { realtimeMessaging, type Message, type Conversation } from "@/lib/realtime-messages"

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      const userConversations = realtimeMessaging.getConversations(user.id)
      setConversations(userConversations)

      if (typeof window !== "undefined") {
        const activeConvId = sessionStorage.getItem("activeConversation")
        if (activeConvId) {
          setSelectedChat(activeConvId)
          sessionStorage.removeItem("activeConversation")
        }
      }
    } catch (error) {
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!selectedChat) return

    const unsubscribe = realtimeMessaging.subscribeToConversation(selectedChat, (updatedMessages) => {
      setMessages(updatedMessages)
    })

    if (user) {
      realtimeMessaging.markAsRead(selectedChat, user.id)
      setConversations(realtimeMessaging.getConversations(user.id))
    }

    return () => unsubscribe()
  }, [selectedChat, user])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const selectedConversation = conversations.find((c) => c.id === selectedChat)

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat || !user) return

    const otherParticipant = selectedConversation?.participants.find((p) => p !== user.id)
    if (!otherParticipant) return

    realtimeMessaging.sendMessage({
      conversationId: selectedChat,
      senderId: user.id,
      receiverId: otherParticipant,
      text: messageText,
    })

    setMessageText("")
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getParticipantInfo = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find((p) => p !== user?.id)
    const initials = otherUserId ? otherUserId.substring(0, 2).toUpperCase() : "U"
    const name = `User ${initials}`
    return { initials, name }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-[#312E81] sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center space-x-3">
            {selectedConversation ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 p-0 hover:bg-white/10 rounded-full"
                onClick={() => setSelectedChat(null)}
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Button>
            ) : (
              <Link href="/">
                <Button variant="ghost" size="sm" className="w-9 h-9 p-0 hover:bg-white/10 rounded-full">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Button>
              </Link>
            )}
            <div className="flex-1">
              {selectedConversation ? (
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-sm font-semibold text-[#1E1B4B]">
                        {getParticipantInfo(selectedConversation).initials}
                      </span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1E1B4B] rounded-full"></div>
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-white">
                      {getParticipantInfo(selectedConversation).name}
                    </h1>
                    <p className="text-xs text-amber-400 font-medium">Active now</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                    <MessageCircle className="w-5 h-5 text-[#1E1B4B]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Messages</h1>
                    <p className="text-sm text-white/60">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
            </div>
            {selectedConversation && (
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="w-9 h-9 p-0 hover:bg-white/10 rounded-full">
                  <Phone className="w-4 h-4 text-white" />
                </Button>
                <Button variant="ghost" size="sm" className="w-9 h-9 p-0 hover:bg-white/10 rounded-full">
                  <Video className="w-4 h-4 text-white" />
                </Button>
                <Button variant="ghost" size="sm" className="w-9 h-9 p-0 hover:bg-white/10 rounded-full">
                  <MoreVertical className="w-4 h-4 text-white" />
                </Button>
              </div>
            )}
          </div>

          {!selectedConversation && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border-0 rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
          )}
        </div>
      </header>

      {!selectedConversation ? (
        /* Conversations List */
        <div className="container mx-auto px-4 pb-20 max-w-5xl">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                When you contact a seller about their product, your conversation will appear here
              </p>
              <Link href="/">
                <Button className="mt-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-foreground font-bold shadow-md rounded-full">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations
                .filter((c) => c.adTitle?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((conversation) => {
                  const participantInfo = getParticipantInfo(conversation)
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedChat(conversation.id)}
                      className="bg-card p-4 cursor-pointer hover:bg-muted/50 transition-all active:scale-[0.99] border-l-4 border-transparent hover:border-amber-400"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary to-[#8B7BC7] rounded-2xl flex items-center justify-center shadow-md">
                            <span className="text-base font-bold text-white">{participantInfo.initials}</span>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 text-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-base font-bold text-foreground truncate">{participantInfo.name}</h3>
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2 font-medium">
                              {new Date(conversation.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {conversation.adTitle && (
                            <Badge variant="secondary" className="mb-2 text-xs bg-primary/10 text-primary border-0">
                              {conversation.adTitle}
                            </Badge>
                          )}
                          <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                            {conversation.lastMessage?.text || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      ) : (
        /* Chat View */
        <div className="container mx-auto max-w-5xl flex flex-col h-[calc(100vh-140px)]">
          {/* Ad Context */}
          {selectedConversation.adTitle && (
            <div className="bg-primary/5 border-b border-border px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-[#5B4B9E] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">π</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Discussing</p>
                  <p className="text-sm font-bold text-foreground">{selectedConversation.adTitle}</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground text-center">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) =>
                message.senderId !== user.id ? (
                  /* Incoming Message */
                  <div key={message.id} className="flex items-start space-x-2 animate-in slide-in-from-left">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-[#8B7BC7] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-xs font-bold text-white">
                        {getParticipantInfo(selectedConversation).initials}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-card rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-border inline-block max-w-[80%]">
                        <p className="text-sm text-foreground leading-relaxed">{message.text}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-2 font-medium">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Outgoing Message */
                  <div key={message.id} className="flex items-start space-x-2 flex-row-reverse animate-in slide-in-from-right">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-xs font-bold text-foreground">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 flex flex-col items-end">
                      <div className="bg-gradient-to-r from-primary to-[#312E81] rounded-2xl rounded-tr-md px-4 py-3 shadow-md inline-block max-w-[80%]">
                        <p className="text-sm text-white font-medium leading-relaxed">{message.text}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 mr-2 font-medium">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )
              ))
            }
          </div>

          {/* Message Input */}
          <div className="bg-card border-t border-border p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 flex-shrink-0 hover:bg-muted/10 rounded-xl">
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 flex-shrink-0 hover:bg-muted/10 rounded-xl">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-12 py-6 border-input rounded-2xl bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-amber-400/50"
                />
                <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 hover:bg-muted/10 rounded-lg">
                  <Smile className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="w-12 h-12 p-0 flex-shrink-0 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-md hover:shadow-lg transition-all"
              >
                <Send className="w-5 h-5 text-foreground" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
