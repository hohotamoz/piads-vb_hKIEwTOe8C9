// Image upload utility for handling real image files

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Convert file to base64 string for storage
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
  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.",
    }
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size too large. Maximum size is 5MB.",
    }
  }

  return { valid: true }
}

/**
 * Compress and resize image
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onerror = () => reject(new Error("Could not read file"))
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onerror = () => reject(new Error("Could not load image"))
      
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          let { width, height } = img

          // Calculate new dimensions maintaining aspect ratio
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d", { alpha: true })
          if (!ctx) {
            reject(new Error("Could not get canvas context"))
            return
          }

          // Use better image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          
          // Draw image
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Could not compress image"))
              }
            },
            file.type === "image/png" ? "image/png" : "image/jpeg",
            quality
          )
        } catch (error) {
          reject(error)
        }
      }
      
      img.src = e.target?.result as string
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Upload image and return base64 URL
 */
export async function uploadImage(file: File): Promise<ImageUploadResult> {
  try {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    // Compress image with timeout
    const compressPromise = compressImage(file)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Image processing timeout")), 30000)
    })

    const compressedBlob = await Promise.race([compressPromise, timeoutPromise])
    const compressedFile = new File([compressedBlob], file.name, { 
      type: file.type === "image/png" ? "image/png" : "image/jpeg" 
    })

    // Convert to base64
    const base64 = await fileToBase64(compressedFile)

    // Verify base64 string is valid
    if (!base64 || !base64.startsWith('data:image')) {
      throw new Error("Invalid image data")
    }

    return {
      success: true,
      url: base64,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    }
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(files: File[]): Promise<ImageUploadResult[]> {
  const uploadPromises = files.map((file) => uploadImage(file))
  return Promise.all(uploadPromises)
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => reject(new Error("Could not load image"))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error("Could not read file"))
    reader.readAsDataURL(file)
  })
}
