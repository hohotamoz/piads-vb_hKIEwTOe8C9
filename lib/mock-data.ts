import type { User, Ad, Notification } from "./types"

export const mockUser: User = {
  id: "1",
  email: "user@piads.network",
  name: "Ahmed Hassan",
  role: "advertiser",
  avatar: "/placeholder.svg?height=100&width=100",
  verified: true,
  createdAt: new Date("2024-01-15"),
  subscription: "premium",
}

// No mock ads - only real user ads from storage
export const mockAds: Ad[] = []

export const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "1",
    title: "New Review",
    message: "Someone reviewed your iPhone 15 Pro Max ad",
    type: "info",
    read: false,
    createdAt: new Date("2024-12-22"),
    actionUrl: "/ads/1",
  },
  {
    id: "2",
    userId: "1",
    title: "Ad Promoted",
    message: "Your ad is now featured for 7 days",
    type: "success",
    read: false,
    createdAt: new Date("2024-12-21"),
  },
  {
    id: "3",
    userId: "1",
    title: "Payment Received",
    message: "You received 50 π from a sale",
    type: "success",
    read: true,
    createdAt: new Date("2024-12-20"),
  },
  {
    id: "4",
    userId: "1",
    title: "New Message",
    message: "You have a new inquiry about your service",
    type: "info",
    read: false,
    createdAt: new Date("2024-12-19"),
  },
  {
    id: "5",
    userId: "1",
    title: "Price Drop Alert",
    message: "An item in your watchlist dropped in price",
    type: "warning",
    read: true,
    createdAt: new Date("2024-12-18"),
  },
]
