// Automatic backup system for user data

const BACKUP_KEY = "piads_backup"
const BACKUP_VERSION = "v1"

interface BackupData {
  version: string
  timestamp: Date
  users: any
  ads: any
  messages: any
  reviews: any
  purchases: any
}

// Create backup of all user data
export function createBackup() {
  if (typeof window === "undefined") return

  try {
    const backup: BackupData = {
      version: BACKUP_VERSION,
      timestamp: new Date(),
      users: localStorage.getItem("currentUser"),
      ads: localStorage.getItem("piads_all_ads"),
      messages: localStorage.getItem("piads_messages"),
      reviews: localStorage.getItem("piads_reviews"),
      purchases: localStorage.getItem("piads_purchases"),
    }

    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup))
    return true
  } catch (error) {
    console.error("Failed to create backup:", error)
    return false
  }
}

// Restore from backup
export function restoreFromBackup(): boolean {
  if (typeof window === "undefined") return false

  try {
    const backupStr = localStorage.getItem(BACKUP_KEY)
    if (!backupStr) return false

    const backup: BackupData = JSON.parse(backupStr)

    // Restore each data type if it exists
    if (backup.users) localStorage.setItem("currentUser", backup.users)
    if (backup.ads) localStorage.setItem("piads_all_ads", backup.ads)
    if (backup.messages) localStorage.setItem("piads_messages", backup.messages)
    if (backup.reviews) localStorage.setItem("piads_reviews", backup.reviews)
    if (backup.purchases) localStorage.setItem("piads_purchases", backup.purchases)

    return true
  } catch (error) {
    console.error("Failed to restore backup:", error)
    return false
  }
}

// Auto-backup on data changes
export function autoBackup() {
  if (typeof window === "undefined") return

  // Create backup every time data changes
  createBackup()
}

// Check if backup exists
export function hasBackup(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(BACKUP_KEY) !== null
}
