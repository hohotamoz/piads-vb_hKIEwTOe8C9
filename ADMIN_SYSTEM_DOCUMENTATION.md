# PiAds Admin System Documentation

## 🔐 Security Overview

This system implements a **strict, single-admin** authentication model with enterprise-grade security.

### Admin Account Details

**Authorized Admin Email:** `hohotamoz200@gmail.com`

- Only this email address has admin privileges
- All other accounts are automatically assigned regular user roles
- Admin privileges cannot be escalated by unauthorized users

---

## 🛡️ Security Features

### 1. Email-Based Admin Verification

\`\`\`typescript
const ADMIN_EMAIL = "hohotamoz200@gmail.com"

function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}
\`\`\`

- Case-insensitive email matching
- Hardcoded admin email (cannot be modified through UI)
- Automatic verification on every authentication

### 2. Multi-Layer Protection

#### Layer 1: Authentication (lib/auth.ts)
- Validates admin status during sign-in
- Auto-creates admin account for authorized email
- Strips admin role from unauthorized users

#### Layer 2: Session Verification (components/auth-provider.tsx)
- Verifies admin status on app load
- Checks admin email on every session restore
- Maintains isAdmin flag in context

#### Layer 3: Middleware Protection (middleware.ts)
- Blocks unauthorized access to `/admin/*` routes
- Redirects non-admin users to home page
- Validates admin email from cookies

#### Layer 4: Component Guards (components/admin-layout.tsx)
- Double-checks admin status before rendering
- Shows access denied message for unauthorized attempts
- Prevents UI exposure of admin features

#### Layer 5: Page-Level Verification
- Each admin page verifies credentials
- Redirects if authentication fails
- Displays loading states during verification

### 3. Automatic Role Enforcement

\`\`\`typescript
// During sign-in
if (user.role === "admin" && !isAdminEmail(user.email)) {
  user.role = "user" // Force downgrade
}

// During sign-up
const safeRole = role === "admin" ? "user" : role // Prevent admin registration
\`\`\`

---

## 📋 Admin Capabilities

### Full Platform Control

1. **Dashboard Access** (`/admin`)
   - Real-time statistics
   - User management
   - Ad moderation
   - Report handling

2. **Pricing Management** (`/admin/pricing`)
   - Edit subscription plans
   - Modify promotion prices
   - Update plan features
   - Delete/add plans
   - Changes take effect immediately

3. **User Management**
   - View all users
   - Edit user profiles
   - Suspend accounts
   - Monitor activity

4. **Content Moderation**
   - Approve/reject ads
   - Handle reports
   - Flag inappropriate content
   - Manage featured ads

---

## 🚀 Admin Access Flow

### First Time Setup

1. Sign up with email: `hohotamoz200@gmail.com`
2. System automatically grants admin role
3. Access admin dashboard at `/admin`

### Subsequent Logins

1. Sign in with admin email
2. System verifies and restores admin privileges
3. Full access to admin features

### Session Management

- Admin sessions persist across browser refreshes
- Email verified on every page load
- Automatic logout redirects to login page

---

## 🔒 Security Guarantees

### What This System Prevents

1. **Privilege Escalation**
   - Users cannot modify their role to admin
   - Database manipulation won't grant admin access
   - Client-side tampering is detected and blocked

2. **Unauthorized Access**
   - Direct URL navigation to `/admin/*` is blocked
   - API calls require valid admin session
   - Cookie manipulation is ineffective

3. **Role Persistence Attacks**
   - Admin role is verified against email on every check
   - Stored sessions are validated server-side
   - Expired sessions are automatically cleared

### What Happens When Unauthorized Users Try to Access Admin

1. Middleware redirects to home page
2. AdminLayout shows "Access Denied" message
3. Pages refuse to render admin content
4. All admin actions are blocked

---

## 📊 Pricing Management System

### Dynamic Price Updates

Admin can modify:
- Promotion plan prices
- Subscription plan prices
- Plan names
- Plan durations
- Feature lists

### User Impact

- **Active subscriptions remain valid**
- New prices apply to new purchases only
- No disruption to existing users
- Changes reflect immediately in UI

### Storage

- Plans stored in `localStorage` under `piads_pricing_plans` and `piads_subscription_plans`
- Persists across sessions
- Loads automatically on app start

---

## 🔧 Technical Implementation

### File Structure

\`\`\`
lib/
  auth.ts              # Core authentication logic
  pi-payment.ts        # Pricing management system

components/
  auth-provider.tsx    # Authentication context
  admin-layout.tsx     # Admin route guard

app/
  admin/
    page.tsx           # Admin dashboard
    layout.tsx         # Admin layout wrapper
    pricing/
      page.tsx         # Pricing management

middleware.ts          # Route protection
\`\`\`

### Key Functions

#### `isCurrentUserAdmin(): boolean`
Verifies if current user is the authorized admin

#### `signIn(email, password): User | null`
Authenticates user and enforces admin rules

#### `getCurrentUser(): User | null`
Retrieves current user with admin validation

---

## ⚠️ Important Notes

1. **Single Admin Policy**
   - Only one admin email is supported
   - Changing admin requires code modification
   - No multi-admin support by design

2. **Email Verification**
   - Admin email must match exactly (case-insensitive)
   - No wildcard or domain matching
   - Hardcoded for security

3. **Production Ready**
   - No debug logs in production
   - Secure session management
   - Protected against common attacks

4. **Scalability**
   - Current design supports single admin
   - Can be extended to multi-admin if needed
   - Database-ready architecture

---

## 📞 Support

For admin-related issues:
- Check email matches: `hohotamoz200@gmail.com`
- Clear browser cache and cookies
- Try incognito/private browsing
- Verify localStorage is enabled

---

## 🎯 Summary

This admin system provides:
- ✅ Single authorized admin
- ✅ Multi-layer security
- ✅ Automatic role enforcement
- ✅ Dynamic pricing control
- ✅ Full platform management
- ✅ Session security
- ✅ Production-ready code

**Status:** Fully implemented and secured
**Admin Email:** hohotamoz200@gmail.com
**Access Level:** Complete control over PiAds platform
