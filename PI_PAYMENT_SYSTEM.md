# Pi Payment System Documentation

## Overview
The application now uses **Pi-Test** (real Pi coins from user wallets) for all payment transactions including subscriptions and product purchases.

## Payment Types

### 1. Subscription Payments
- Users can subscribe to Premium or Enterprise plans
- Payment is processed through Pi Network SDK
- Subscription status and features are automatically activated upon successful payment
- Subscription data is stored locally and synced with payment history

**Features by Plan:**
- **Basic (Free)**: Up to 5 ads, standard support
- **Premium (99π)**: Unlimited ads, 5 featured ads/month, priority support, analytics, no commission
- **Enterprise (299π)**: Everything in Premium + unlimited featured ads, API access, custom branding

### 2. Product Purchases
- Buyers can purchase products listed in ads
- Quantity selection available
- Requires delivery address and phone number
- Payment processed through Pi Network SDK
- Purchase history tracked for both buyer and seller

## How It Works

### For Subscriptions:
1. User clicks on a subscription plan
2. Pi Browser opens for authentication
3. User approves payment in Pi wallet
4. Payment is verified
5. Subscription is activated with all features
6. Expiry date is calculated and stored
7. User can access premium features immediately

### For Product Purchases:
1. User views product and clicks "Buy Now"
2. Enters quantity, delivery address, and phone number
3. Pi Browser opens for payment
4. User confirms payment in Pi wallet
5. Payment is processed
6. Purchase is completed and both parties are notified
7. Transaction stored in purchase history

## Technical Implementation

### Payment Flow:
\`\`\`typescript
piPaymentService.createPayment(amount, memo, metadata)
  → Opens Pi Browser
  → User approves in wallet
  → Returns payment status
  → If completed: Activate subscription/complete purchase
  → If cancelled/failed: Show error message
\`\`\`

### Storage:
- **Subscriptions**: `piads_subscriptions` in localStorage
- **Purchases**: `piads_purchases` in localStorage
- **Payment History**: `payment_history_{userId}` in localStorage

### Security:
- All payments go through official Pi Network SDK
- Transaction IDs are stored for verification
- Payment status is checked before activation
- User authentication required before payment

## User Features

### Subscription Management:
- View current subscription status
- See expiry date
- Access premium features based on plan
- Automatic feature limitation when subscription expires

### Purchase Tracking:
- View all purchases in wallet/history
- Track order status
- Access transaction IDs
- Review purchase details

## Admin Features
- View all transactions
- Monitor subscription revenue
- Track purchase activities
- Manage pricing plans

## Testing
Use Pi Browser in sandbox/testnet mode to test payments without using real Pi coins during development.

## Important Notes
1. All payments use real Pi coins from user wallets (Pi-Test)
2. Payments are processed through official Pi Network SDK
3. Subscription features activate immediately upon successful payment
4. Purchase transactions create verifiable records
5. Both buyers and sellers receive notifications
6. Payment history is maintained for all users
