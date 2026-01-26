"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { PI_NETWORK_CONFIG, BACKEND_URLS } from "@/lib/system-config"
import { api, setApiAuthToken } from "@/lib/api"

export type LoginDTO = {
  id: string
  username: string
  credits_balance: number
  terms_accepted: boolean
}

interface PiAuthResult {
  accessToken: string
  user: {
    uid: string
    username: string
  }
}

declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>
      authenticate: (scopes: string[], onIncompletePaymentFound?: (payment: any) => void) => Promise<PiAuthResult>
      createPayment: (
        paymentData: {
          amount: number
          memo: string
          metadata: object
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void
          onReadyForServerCompletion: (paymentId: string, txid: string) => void
          onCancel: (paymentId: string) => void
          onError: (error: Error, payment?: any) => void
        },
      ) => void
    }
  }
}

interface PiAuthContextType {
  isAuthenticated: boolean
  authMessage: string
  piAccessToken: string | null
  userData: LoginDTO | null
  reinitialize: () => Promise<void>
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined)

const loadPiSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && typeof window.Pi !== "undefined") {
      console.log("[v0] Pi SDK already loaded")
      resolve()
      return
    }

    const script = document.createElement("script")
    if (!PI_NETWORK_CONFIG.SDK_URL) {
      reject(new Error("SDK URL is not set"))
      return
    }
    script.src = PI_NETWORK_CONFIG.SDK_URL
    script.async = true

    script.onload = () => {
      console.log("[v0] ✅ Pi SDK script loaded successfully")
      resolve()
    }

    script.onerror = () => {
      console.error("[v0] ❌ Failed to load Pi SDK script")
      reject(new Error("Failed to load Pi SDK script"))
    }

    document.head.appendChild(script)
  })
}

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Ready")
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null)
  const [userData, setUserData] = useState<LoginDTO | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("pi_access_token")
      const storedUserData = localStorage.getItem("pi_user_data")

      if (storedToken && storedUserData) {
        console.log("[v0] Found existing session in localStorage")
        try {
          const parsedUserData = JSON.parse(storedUserData)
          setPiAccessToken(storedToken)
          setUserData(parsedUserData)
          setIsAuthenticated(true)
          setApiAuthToken(storedToken)
          console.log("[v0] ✅ Session restored successfully")
        } catch (error) {
          console.error("[v0] Failed to parse stored user data:", error)
        }
      }
    }
  }, [])

  const authenticateAndLogin = async (): Promise<void> => {
    try {
      setAuthMessage("Authenticating with Pi Network...")
      console.log("[v0] Starting Pi authentication...")

      const piAuthResult = await window.Pi.authenticate(["username", "payments"], (payment) => {
        console.log("[v0] Incomplete payment found:", payment)
      })
      console.log("[v0] Pi authentication successful:", piAuthResult.user.username)

      setAuthMessage("Logging in to backend...")
      const loginRes = await api.post<LoginDTO>(BACKEND_URLS.LOGIN, {
        pi_auth_token: piAuthResult.accessToken,
      })

      console.log("[v0] Backend login successful")

      if (piAuthResult?.accessToken) {
        setPiAccessToken(piAuthResult.accessToken)
        setApiAuthToken(piAuthResult.accessToken)

        localStorage.setItem("pi_access_token", piAuthResult.accessToken)
        localStorage.setItem("pi_user_data", JSON.stringify(loginRes.data))
      }

      setUserData(loginRes.data)
      setIsAuthenticated(true)
      setAuthMessage("Authenticated")
      console.log("[v0] ✅ Full authentication flow completed")
    } catch (error) {
      console.error("[v0] Authentication error:", error)
      throw error
    }
  }

  const initializePiAndAuthenticate = async () => {
    if (isInitializing) {
      console.log("[v0] Initialization already in progress")
      return
    }

    if (isAuthenticated) {
      console.log("[v0] Already authenticated, skipping initialization")
      return
    }

    setIsInitializing(true)

    try {
      setAuthMessage("Loading Pi Network SDK...")
      console.log("[v0] Starting Pi SDK initialization...")

      await loadPiSDK()

      if (typeof window.Pi === "undefined") {
        throw new Error("Pi object not available after script load")
      }

      setAuthMessage("Initializing Pi Network...")
      console.log("[v0] Initializing Pi SDK...")

      await window.Pi.init({
        version: "2.0",
        sandbox: PI_NETWORK_CONFIG.SANDBOX,
      })

      console.log("[v0] Pi SDK initialized, starting authentication...")
      await authenticateAndLogin()
    } catch (err) {
      console.error("[v0] ❌ Pi Network initialization failed:", err)
      setAuthMessage("Authentication failed")
      setIsAuthenticated(false)
    } finally {
      setIsInitializing(false)
    }
  }

  const value: PiAuthContextType = {
    isAuthenticated,
    authMessage,
    piAccessToken,
    userData,
    reinitialize: initializePiAndAuthenticate,
  }

  return <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
}

export function usePiAuth() {
  const context = useContext(PiAuthContext)
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider")
  }
  return context
}
