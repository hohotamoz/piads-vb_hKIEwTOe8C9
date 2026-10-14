# PiAds - Pi Network Testnet Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your Pi API credentials
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Tests
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
```

## Pi Network Integration

### Authentication
- **Method**: Pi Network SDK only
- **Scopes**: `username`, `payments`
- **Verification**: Server-side via `/v2/me`
- **Session**: HTTP-only cookie with HMAC signature

### Payment Flow
1. Client creates payment via `Pi.createPayment()`
2. Server approves via `POST /v2/payments/{id}/approve`
3. Server completes via `POST /v2/payments/{id}/complete`
4. Service delivered only after successful completion

### Security
- API Key stored in server environment only
- Sessions use HMAC-SHA256 signatures
- All payments verified via Platform API
- No client-side amount manipulation

## Testnet Configuration

```env
PI_API_KEY=your_server_api_key
PI_API_URL=https://api.minepi.com
NEXT_PUBLIC_PI_SANDBOX=false
PI_ADMIN_UID=your_pi_uid
SESSION_SECRET=random_secret_key
```

## Testing Checklist

- [ ] Login with Pi Network
- [ ] Invalid token rejection
- [ ] Protected route access control
- [ ] Payment creation
- [ ] Payment approval
- [ ] Payment completion
- [ ] No service on cancellation
- [ ] No service on failure
- [ ] No duplicate service delivery
- [ ] Admin route protection

## Documentation

- [Pi Developer Docs](https://developers.minepi.com/docs/)
- [Payment Guide](https://developers.minepi.com/docs/accept-payment/Payments)
- [Auth Guide](https://developers.minepi.com/docs/authenticate-user/Authentication/)
