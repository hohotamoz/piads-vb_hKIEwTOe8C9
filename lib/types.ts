export type UserRole = "user" | "advertiser" | "store" | "developer" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  verified: boolean
  createdAt: Date
  subscription?: "free" | "premium" | "enterprise"
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface Ad {
  id: string
  title: string
  titleAr?: string
  description: string
  descriptionAr?: string
  price: string
  images: string[]
  category: string
  location: string
  locationAr?: string
  userId: string
  seller: string
  rating: number
  reviews: number
  featured: boolean
  promoted: boolean
  views: number
  createdAt: Date
  tags: string[]
  status?: "active" | "paused" | "sold"
  stock?: number
  isPurchasable?: boolean
  stats?: {
    totalAds?: number
    averageRating?: number
    totalRatings?: number
    piBalance?: number
  }
}

export interface Review {
  id: string
  adId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: Date
  verified?: boolean
}

export interface Purchase {
  id: string
  adId: string
  buyerId: string
  sellerId: string
  quantity: number
  totalPrice: number
  piPaymentId: string
  status: "pending" | "completed" | "cancelled"
  createdAt: Date
  deliveryAddress?: string
  phoneNumber?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: Date
  actionUrl?: string
}
