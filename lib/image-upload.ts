import { supabase, isSupabaseConfigured } from './supabase'

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Convert file to base64 string for fallback storage
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Please upload JPEG, PNG, WebP, or GIF images." }
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: "File too large. Maximum size is 5MB." }
  }

  return { valid: true }
}

/**
 * Upload image to Supabase Storage or fallback to base64
 */
export async function uploadImage(file: File, userId: string): Promise<ImageUploadResult> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  // Try Supabase Storage first
  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('ad-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('ad-images')
          .getPublicUrl(data.path)

        return { success: true, url: urlData.publicUrl }
      }
      
      console.warn('[image-upload] Supabase storage upload failed, falling back to base64:', error?.message)
    } catch (err) {
      console.warn('[image-upload] Supabase storage error, falling back to base64:', err)
    }
  }

  // Fallback: convert to base64
  try {
    const base64 = await fileToBase64(file)
    return { success: true, url: base64 }
  } catch (err) {
    return { success: false, error: 'Failed to process image' }
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(url: string): Promise<void> {
  if (!isSupabaseConfigured || url.startsWith('data:')) return

  try {
    // Extract path from URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/ad-images/')
    if (pathParts.length > 1) {
      await supabase.storage.from('ad-images').remove([pathParts[1]])
    }
  } catch (err) {
    console.warn('[image-upload] Failed to delete image:', err)
  }
}
