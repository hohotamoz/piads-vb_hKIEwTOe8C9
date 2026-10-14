# PiAds - Pi Network Testnet Setup Guide

## Overview

This guide explains how to set up PiAds for Pi Network Testnet development and testing.

## Prerequisites

1. **Pi Browser** - Download from Pi Network
2. **Pi Developer Account** - Register at https://developers.minepi.com
3. **Node.js 18+** and npm

## Step 1: Register Your App on Pi Developer Portal

1. Go to https://developers.minepi.com in Pi Browser
2. Register your app:
   - **Name**: PiAds
   - **Description**: Smart Advertising Platform for Pi Network
   - **URL**: Your Testnet app URL (e.g., `https://piads.testnet.pi`)
   - **Platform**: Web
3. After registration, you'll receive:
   - **App ID**
   - **API Key** (Server API Key - keep this secret!)

## Step 2: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   copy .env.local.example .env.local
   ```

2. Fill in your values:
   ```env
   PI_API_KEY=your_actual_api_key_here
   PI_API_URL=https://api.minepi.com
   NEXT_PUBLIC_PI_SANDBOX=false
   PI_ADMIN_UID=your_pi_uid_here
   SESSION_SECRET=generate_a_random_string_here
   APP_URL=https://your-testnet-app-url.com
   ```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run Development Server

```bash
npm run dev
```

## Step 5: Test in Pi Browser

1. Open Pi Browser
2. Navigate to your Testnet app URL
3. Click "Login with Pi Network"
4. Authenticate with your Pi account
5. Test the payment flow

## Testnet vs Sandbox

| Feature | Testnet | Sandbox |
|---------|---------|---------|
| URL | `*.testnet.pi` | `sandbox.minepi.com` |
| `sandbox` param | `false` | `true` |
| Purpose | Production testing | Development |
| Real payments | Yes (Testnet Pi) | No |

## Payment Flow

1. User clicks "Login with Pi Network"
2. Pi SDK authenticates user
3. Backend verifies token with `/v2/me`
4. Secure session created
5. User creates payment via `Pi.createPayment()`
6. Server approves via `POST /v2/payments/{id}/approve`
7. Server completes via `POST /v2/payments/{id}/complete`
8. Service delivered only after completion

## Admin Access

To grant admin access:
1. Get your Pi UID from Pi Browser
2. Add it to `PI_ADMIN_UID` in `.env.local`
3. Restart the server

## Troubleshooting

### "Invalid Pi token"
- Check that `PI_API_KEY` is correct
- Verify token is being sent correctly

### "Payment approval failed"
- Ensure `PI_API_KEY` has payment permissions
- Check Pi Developer Portal settings

### CORS errors
- Ensure `APP_URL` matches your registered URL
- Add your URL to CORS whitelist in Developer Portal

## Security Notes

- **NEVER** expose `PI_API_KEY` in client-side code
- **NEVER** commit `.env.local` to version control
- **ALWAYS** use HTTPS in production
- **ALWAYS** validate all inputs on the server

## Next Steps

1. Test authentication flow
2. Test payment flow with small amounts
3. Deploy to Testnet
4. Submit for Mainnet review (when ready)
