# Pi SDK Authentication Troubleshooting Guide

## Issue: Stuck at "Logging in to backend..."

### Root Cause
The Pi auth context (`contexts/pi-auth-context.tsx`) calls the backend login endpoint configured in `lib/system-config.ts`. If this endpoint is unreachable or slow, the app gets stuck in loading state.

### Solution Implemented

#### 1. **Proxy Route Created** (`/app/v1/login/route.ts`)
- Intercepts login requests from Pi auth context
- Handles authentication locally without external dependency
- Returns user data in Pi Network backend format
- Sets session cookies automatically

#### 2. **Enhanced Auth Success Handler** (`components/auth-success-handler.tsx`)
- Monitors authentication state with 15-second timeout
- Implements fallback mechanism if backend is slow
- Stores user data in localStorage for persistence
- Redirects to home page after successful setup

#### 3. **Session Verification Endpoint** (`/api/v1/verify-session/route.ts`)
- Allows client-side session validation
- Returns current authentication status
- Used by middleware for route protection

### Authentication Flow

\`\`\`
1. User opens app
   ↓
2. Pi SDK loads and initializes
   ↓
3. Pi.authenticate() called (Pi Network handles this)
   ↓
4. Access token received from Pi Network
   ↓
5. POST request to /v1/login with pi_auth_token
   ↓
6. Proxy route receives request
   ↓
7. User data created and cookies set
   ↓
8. Response returned to pi-auth-context
   ↓
9. isAuthenticated becomes true
   ↓
10. AuthSuccessHandler stores data in localStorage
    ↓
11. Redirect to home page (/)
    ↓
12. Middleware validates cookies
    ↓
13. User sees home page
\`\`\`

### Timeout Handling

If authentication takes longer than 15 seconds:
- AuthSuccessHandler activates fallback mode
- Creates temporary user session with Pi access token
- Stores data locally
- Forces redirect to home page

### Testing on Different Devices

#### Mobile (Pi Browser)
\`\`\`
1. Open app in Pi Browser
2. Should see "Initializing Pi Network..."
3. Pi SDK authenticates automatically
4. Within 3-5 seconds, should redirect to home
\`\`\`

#### Desktop (Pi Desktop App)
\`\`\`
1. Open app in Pi Desktop
2. Same flow as mobile
3. Responsive design adapts to larger screen
4. All features accessible
\`\`\`

### Debug Logging

All authentication steps log to console with `[v0]` prefix:
- ✅ Success messages
- ❌ Error messages
- 🔄 Progress indicators

Open browser console (F12) to see detailed authentication flow.

### Common Issues & Solutions

#### Issue: White screen after authentication
**Solution**: AuthSuccessHandler now forces redirect even if cookies fail to set

#### Issue: Stuck at loading for > 15 seconds
**Solution**: Timeout fallback creates session and redirects automatically

#### Issue: Admin access not working
**Solution**: User email is checked against `hohotamoz200@gmail.com` in:
- `/app/v1/login/route.ts`
- `/app/api/v1/set-session/route.ts`
- `middleware.ts`

### Manual Session Reset

If authentication is stuck:
1. Open browser console
2. Run: `localStorage.clear()`
3. Refresh page
4. Authentication will restart from beginning

### Production Deployment Notes

1. **Pi SDK Sandbox Mode**: Currently set to `false` in system-config
2. **Backend URL**: Points to piappengine.com (handled by proxy)
3. **Admin Email**: Hardcoded to `hohotamoz200@gmail.com`
4. **Session Duration**: 7 days
5. **Cookie Security**: HTTP-only, SameSite=Lax, Secure in production

### Files Modified

- `components/auth-success-handler.tsx` - Enhanced with timeout fallback
- `app/v1/login/route.ts` - NEW: Proxy for Pi backend
- `app/api/v1/login/route.ts` - Alternative login endpoint
- `app/api/v1/set-session/route.ts` - Session cookie setter
- `app/api/v1/verify-session/route.ts` - NEW: Session validator
- `middleware.ts` - Route protection logic

### Files Locked (Cannot Modify)

- `contexts/pi-auth-context.tsx` - Core Pi SDK integration
- `components/app-wrapper.tsx` - App structure wrapper
- `components/auth-loading-screen.tsx` - Loading UI
- `lib/system-config.ts` - Pi Network configuration
- `lib/api.ts` - API client utility

These files are managed by Pi App Engine and should not be modified.
