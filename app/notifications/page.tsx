"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Bell, CheckCheck } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/notifications"
import type { Notification } from "@/lib/types"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const userNotifications = getNotifications(user.id)
    setNotifications(userNotifications)
  }, [user, router])

  const handleMarkAsRead = (id: string) => {
    if (!user) return
    markAsRead(user.id, id)
    setNotifications(getNotifications(user.id))
  }

  const handleMarkAllAsRead = () => {
    if (!user) return
    markAllAsRead(user.id)
    setNotifications(getNotifications(user.id))
  }

  if (!user) return null

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
                {unreadCount > 0 && <p className="text-sm text-slate-500">{unreadCount} unread</p>}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAllAsRead}
                className="border-slate-200 bg-transparent"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No notifications</h2>
            <p className="text-sm text-slate-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-0 shadow-sm cursor-pointer transition-all ${
                  !notification.read ? "bg-emerald-50/50" : "bg-white"
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        notification.type === "success"
                          ? "bg-emerald-100"
                          : notification.type === "warning"
                            ? "bg-amber-100"
                            : notification.type === "error"
                              ? "bg-red-100"
                              : "bg-blue-100"
                      }`}
                    >
                      <Bell
                        className={`w-5 h-5 ${
                          notification.type === "success"
                            ? "text-emerald-600"
                            : notification.type === "warning"
                              ? "text-amber-600"
                              : notification.type === "error"
                                ? "text-red-600"
                                : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-sm font-medium text-slate-900">{notification.title}</h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0 ml-2 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">{formatTimeAgo(notification.createdAt)}</span>
                        {notification.actionUrl && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600">
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}
