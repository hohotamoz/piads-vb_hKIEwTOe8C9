# Pi Network Payment Integration Setup

## Overview
This app uses the official Pi SDK for secure payment processing. All transactions go through Pi Network's infrastructure directly to your wallet.

## Features Implemented

### 1. Authentication with Payment Scope
- Users authenticate with `['username', 'payments']` scopes
- Handles incomplete payments on login
- Secure session management with localStorage

### 2. Payment Flow
The payment process follows Pi Network's official flow:

\`\`\`
User clicks "Subscribe/Purchase"
  ↓
Pi.createPayment() is called with amount, memo, metadata
  ↓
onReadyForServerApproval → Backend verifies payment
  ↓
onReadyForServerCompletion → Payment confirmed, subscription activated
  ↓
User redirected to success page
\`\`\`

### 3. Payment Callbacks
- **onReadyForServerApproval**: Server validates payment before blockchain submission
- **onReadyForServerCompletion**: Server records completed payment with transaction ID
- **onCancel**: User cancelled payment
- **onError**: Payment failed

### 4. Subscription Management
- Subscriptions stored in localStorage with expiry dates
- Automatic status checking on page load
- Support for Premium and Enterprise plans

## Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Add your Pi API key from https://developer.pi.network
3. Set `NEXT_PUBLIC_PI_MAINNET=false` for sandbox testing
4. Set `NEXT_PUBLIC_PI_MAINNET=true` for production

## Backend Requirements

Your backend should implement these endpoints:

### POST /api/payments/approve
- Validates payment before blockchain submission
- Checks user permissions and payment details
- Returns success/failure

### POST /api/payments/complete
- Records completed payment in database
- Activates subscription/promotion
- Stores transaction ID

### GET /api/payments/verify/:paymentId
- Verifies payment status
- Returns payment details

## Security Notes

1. **Never store private keys** - Pi SDK handles all wallet operations
2. **Always validate on server** - Don't trust client-side payment confirmations
3. **Use HTTPS** - Required for production
4. **Verify transaction IDs** - Check against Pi blockchain

## Testing

1. Enable sandbox mode: `NEXT_PUBLIC_PI_MAINNET=false`
2. Use Pi testnet for testing payments
3. Test all payment scenarios:
   - Successful payment
   - Cancelled payment
   - Failed payment
   - Incomplete payment resumption

## Production Checklist

- [ ] Set `NEXT_PUBLIC_PI_MAINNET=true`
- [ ] Add production Pi API key
- [ ] Test with real Pi payments
- [ ] Implement proper database storage
- [ ] Set up payment webhook handlers
- [ ] Add payment receipt/invoice generation
- [ ] Implement refund handling
- [ ] Add payment history UI

## Support

For Pi SDK issues: https://developers.minepi.com
For app-specific issues: Contact your development team
