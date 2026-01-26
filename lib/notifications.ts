import type { Notification } from "./types"

const NOTIFICATIONS_KEY = "piads_notifications"

export function getNotifications(userId: string): Notification[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(`${NOTIFICATIONS_KEY}_${userId}`)
  if (stored) {
    try {
      return JSON.parse(stored).map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
      }))
    } catch {
      return []
    }
  }
  return []
}

export function saveNotifications(userId: string, notifications: Notification[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(`${NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(notifications))
}

export function addNotification(userId: string, notification: Omit<Notification, "id" | "createdAt">): void {
  const notifications = getNotifications(userId)
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  }
  notifications.unshift(newNotification)
  saveNotifications(userId, notifications)
}

export function markAsRead(userId: string, notificationId: string): void {
  const notifications = getNotifications(userId)
  const updated = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
  saveNotifications(userId, updated)
}

export function markAllAsRead(userId: string): void {
  const notifications = getNotifications(userId)
  const updated = notifications.map((n) => ({ ...n, read: true }))
  saveNotifications(userId, updated)
}

export function getUnreadCount(userId: string): number {
  const notifications = getNotifications(userId)
  return notifications.filter((n) => !n.read).length
}
