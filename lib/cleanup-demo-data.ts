// Utility to cleanup ONLY demo/test data - preserves all real user data

const DEMO_USER_IDS = ["demo", "test", "user-demo", "1", "2", "3"] // IDs to consider as demo
const DEMO_SELLER_NAMES = ["TechStore_Pi", "DevExpert_Pi", "LuxuryTime_Pi"]

export function cleanupAllDemoData() {
  if (typeof window === "undefined") return

  // Check if cleanup has already been done
  const cleanupDone = localStorage.getItem("piads_cleanup_done")
  if (cleanupDone === "true") {
    return // Don't run cleanup again
  }

  try {
    let cleanedSomething = false

    // Clean demo data in messages
    const messagesData = localStorage.getItem("piads_messages")
    if (messagesData) {
      try {
        const parsed = JSON.parse(messagesData)
        let hasChanges = false
        
        // Clean conversations
        if (parsed.conversations) {
          const cleanConversations: any = {}
          for (const [key, conv] of Object.entries(parsed.conversations as any)) {
            const participants = conv.participants || []
            const hasDemo = participants.some((p: string) => 
              DEMO_USER_IDS.some(demoId => p.includes(demoId))
            )
            if (!hasDemo) {
              cleanConversations[key] = conv
            } else {
              hasChanges = true
            }
          }
          parsed.conversations = cleanConversations
        }
        
        // Clean messages
        if (parsed.messages) {
          const cleanMessages: any = {}
          for (const [key, msgs] of Object.entries(parsed.messages as any)) {
            if (parsed.conversations && parsed.conversations[key]) {
              cleanMessages[key] = msgs
            } else {
              hasChanges = true
            }
          }
          parsed.messages = cleanMessages
        }
        
        if (hasChanges) {
          localStorage.setItem("piads_messages", JSON.stringify(parsed))
          cleanedSomething = true
        }
      } catch (error) {
        console.error("Error cleaning messages:", error)
      }
    }
    
    // Clean demo ads only from "piads_all_ads" key
    const adsData = localStorage.getItem("piads_all_ads")
    if (adsData) {
      try {
        const parsed = JSON.parse(adsData)
        if (Array.isArray(parsed)) {
          // Filter out ONLY demo ads - keep all real user ads
          const cleanAds = parsed.filter((ad: any) => {
            const isDemoUser = DEMO_USER_IDS.includes(ad.userId)
            const isDemoSeller = DEMO_SELLER_NAMES.includes(ad.seller)
            return !isDemoUser && !isDemoSeller
          })
          
          if (cleanAds.length !== parsed.length) {
            localStorage.setItem("piads_all_ads", JSON.stringify(cleanAds))
            cleanedSomething = true
          }
        }
      } catch (error) {
        console.error("Error cleaning ads:", error)
      }
    }

    // Mark cleanup as done so it doesn't run again
    if (cleanedSomething) {
      localStorage.setItem("piads_cleanup_done", "true")
    }
  } catch (error) {
    console.error("Error during cleanup:", error)
  }
}
