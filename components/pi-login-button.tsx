"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

// REMOVED CONFLICTING DECLARATION
// declare global {
//   interface Window {
//     Pi: any
//   }
// }

export function PiLoginButton() {
    const [loading, setLoading] = useState(false)
    const [isPiBrowser, setIsPiBrowser] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        // Check if running in Pi Browser
        const checkPi = () => {
            const ua = navigator.userAgent
            if (ua.includes("PiBrowser") || typeof window.Pi !== "undefined") {
                setIsPiBrowser(true)
            }
        }
        checkPi()
    }, [])

    const handlePiLogin = async () => {
        setLoading(true)
        try {
            if (!window.Pi) {
                throw new Error("Pi SDK not loaded")
            }

            // 1. Authenticate with Pi SDK
            const scopes = ['username', 'payments']
            const onIncompletePaymentFound = (payment: any) => {
                // Handle incomplete payments if needed
                console.log("Incomplete payment found", payment)
            }

            const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound)

            // 2. Exchange credentials with our Backend
            const response = await fetch('/api/auth/pi-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authResult)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Login failed")
            }

            // 3. Set Supabase Session
            const { error } = await supabase.auth.setSession(data.session)
            if (error) throw error

            toast({
                title: "Welcome Back!",
                description: `Signed in as @${authResult.user.username}`,
            })

            // 4. Redirect
            router.push("/")
            router.refresh()

        } catch (error: any) {
            console.error("Pi Login Error:", error)
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message || "Could not authenticate with Pi Network",
            })
        } finally {
            setLoading(false)
        }
    }

    // Only show if in Pi Browser (or for dev testing if forced)
    // For now we return the button always for visibility or control via parent?
    // User asked to replace Google/Facebook inside Pi Browser.
    // We can return null if not isPiBrowser?
    // Let's letting the parent decide or show a "Connect Pi" button.

    if (!isPiBrowser) return null

    return (
        <Button
            onClick={handlePiLogin}
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-[#FBC02D] to-[#F57F17] hover:from-[#FBC02D]/90 hover:to-[#F57F17]/90 text-black font-bold rounded-full shadow-lg transition-all"
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Authenticating...
                </>
            ) : (
                <>
                    <span className="text-lg mr-2 font-black">π</span>
                    Login with Pi Network
                </>
            )}
        </Button>
    )
}
