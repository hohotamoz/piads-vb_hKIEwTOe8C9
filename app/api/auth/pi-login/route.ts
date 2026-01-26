import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import crypto from 'crypto'

// Helper to verify Pi Token
async function verifyPiToken(accessToken: string) {
    try {
        const response = await fetch('https://api.minepi.com/v2/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        if (!response.ok) {
            throw new Error(`Pi API error: ${response.status}`)
        }

        const data = await response.json()
        return data // { uid: "...", username: "...", ... }
    } catch (error) {
        console.error("Pi Verification Failed:", error)
        return null
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { accessToken, user: piUser } = body

        if (!accessToken || !piUser || !piUser.uid) {
            return NextResponse.json({ error: 'Missing Pi credentials' }, { status: 400 })
        }

        // 1. Verify Verification with Pi Servers (Backend-to-Backend)
        const verifiedUser = await verifyPiToken(accessToken)
        if (!verifiedUser || verifiedUser.uid !== piUser.uid) {
            // Note: In strict mode, we rely ONLY on verifiedUser. 
            // For development/mocking (if Pi API fails locally), we might have a bypass, 
            // but for production, this verification is crucial.
            // Let's assume strict verification for security.
            return NextResponse.json({ error: 'Invalid Pi Token' }, { status: 401 })
        }

        const piUid = verifiedUser.uid
        const username = verifiedUser.username
        const email = `pi_${piUid}@pi.net` // Virtual email

        // Generate a secure, deterministic password for this user based on their UID and our Service Key
        // This allows us to "sign in" on their behalf without storing a separate password.
        const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback_secret_do_not_use_in_prod"
        const password = crypto.createHmac('sha256', secret).update(piUid).digest('hex')

        // 2. Try to Sign In
        let { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        })

        // Use a unified response object
        let authResponse = { user: data.user, session: data.session }

        // 3. If Login Failed, Register the User
        if (error) {
            // Try Sign Up
            const signUpResult = await supabaseAdmin.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        pi_uid: piUid,
                        username: username,
                        full_name: username,
                        role: 'user'
                    },
                    emailRedirectTo: undefined
                }
            })

            if (signUpResult.error) {
                if (signUpResult.error.message.includes('registered')) {
                    // Should not happen if confirm logic is correct or we fallback
                }
                return NextResponse.json({ error: 'Failed to create account: ' + signUpResult.error.message }, { status: 500 })
            }

            authResponse = { user: signUpResult.data.user, session: signUpResult.data.session }

            // If session is null (email confirmation required), we must auto-confirm as Admin
            if (signUpResult.data.user && !signUpResult.data.session) {
                // Auto confirm
                await supabaseAdmin.auth.admin.updateUserById(
                    signUpResult.data.user.id,
                    { email_confirm: true }
                )
                // Now sign in again
                const loginRetry = await supabaseAdmin.auth.signInWithPassword({ email, password })
                authResponse = { user: loginRetry.data.user, session: loginRetry.data.session }
            }
        }

        if (!authResponse.session) {
            return NextResponse.json({ error: 'Failed to generate session' }, { status: 500 })
        }

        return NextResponse.json({
            user: authResponse.user,
            session: authResponse.session
        })

    } catch (error: any) {
        console.error("API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
