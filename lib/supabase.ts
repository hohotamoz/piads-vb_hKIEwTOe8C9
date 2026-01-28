import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if Supabase credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[v0] Supabase credentials not found. Database features will be disabled.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      ads: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          price: number
          category: string
          region: string
          images: string[]
          status: 'active' | 'pending' | 'expired' | 'sold'
          views: number
          favorites: number
          is_promoted: boolean
          promotion_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          price: number
          category: string
          region: string
          images?: string[]
          status?: 'active' | 'pending' | 'expired' | 'sold'
          views?: number
          favorites?: number
          is_promoted?: boolean
          promotion_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          price?: number
          category?: string
          region?: string
          images?: string[]
          status?: 'active' | 'pending' | 'expired' | 'sold'
          views?: number
          favorites?: number
          is_promoted?: boolean
          promotion_expires_at?: string | null
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          ad_id: string
          reviewer_id: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          ad_id: string
          reviewer_id: string
          rating: number
          comment: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          ad_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ad_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role: string
          avatar: string | null
          verified: boolean
          preferences: any
          stats: any
          password_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          role?: string
          avatar?: string | null
          verified?: boolean
          preferences?: any
          stats?: any
          password_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: string
          avatar?: string | null
          verified?: boolean
          preferences?: any
          stats?: any
          password_hash?: string | null
          updated_at?: string
        }
      }
    }
  }
}
