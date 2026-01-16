# SME Onboarding & Registration Flow

## Overview

The onboarding process creates a complete SME account with:
1. **Clerk Organization** (for multi-tenancy)
2. **Clerk User** (the business owner)
3. **Business Record** (in your database)
4. **Stripe Subscription** (based on business size)

## Registration Flow

### Step 1: Business Information
- **Business Name** (required)
- **Industry** (required) - dropdown selection
- **Business Size** (required) - determines tier and pricing:
  - **1-5 employees** → Tier 1, max 5 seats
  - **6-10 employees** → Tier 1, max 10 seats
  - **11-25 employees** → Tier 2, max 25 seats (unlocks audit logs, shared workspaces)
  - **26-50 employees** → Tier 2, max 50 seats
  - **50+ employees** → Tier 3, unlimited seats (unlocks SSO, SCIM, custom roles)

### Step 2: Personal Information
- **First Name** (required)
- **Last Name** (required)
- **Email Address** (required) - used for Clerk authentication
- **Phone Number** (required)

### Step 3: Account Setup
- **Password** (required) - min 8 characters
- **Confirm Password** (required)

### Step 4: Business Address
- **Street Address** (required)
- **City** (required)
- **Postcode** (required)

### Step 5: Success & Email Verification
- User receives verification email from Clerk
- Must verify email before full access
- Redirected to sign-in page

## What Happens During Registration

### 1. API Call (`/api/onboarding`)
```typescript
POST /api/onboarding
{
  businessName: "ABC Ltd",
  industry: "retail",
  businessSize: "6-10",
  firstName: "John",
  lastName: "Smith",
  email: "john@abcltd.com",
  phone: "07123456789",
  password: "SecurePass123",
  address: "123 High Street",
  city: "London",
  postcode: "SW1A 1AA"
}
```

### 2. Backend Processing (`lib/clerk/onboarding.ts`)
1. **Validates** business size and maps to tier
2. **Creates Clerk User** with email/password
3. **Creates Clerk Organization** (SME tenant)
4. **Creates Business Record** in database with:
   - Clerk organization ID
   - Business size → max seats
   - Default seat count
5. **Creates User Record** in database:
   - Links to Clerk user ID
   - Role: OWNER (first user)
   - Links to business
6. **Sets up Stripe Subscription**:
   - Creates Stripe customer
   - Creates subscription based on tier
   - Sets per-seat pricing

### 3. Business Size → Tier Mapping

| Business Size | Max Seats | Tier | Features Unlocked |
|--------------|-----------|------|-------------------|
| 1-5          | 5         | 1    | Basic features, individual data |
| 6-10         | 10        | 1    | Basic features, individual data |
| 11-25        | 25        | 2    | + Audit logs, shared workspaces, admin dashboard |
| 26-50        | 50        | 2    | + Audit logs, shared workspaces, admin dashboard |
| 50+          | Unlimited | 3    | + SSO, SCIM, custom roles |

## Login Flow

### After Registration
1. User receives verification email
2. Clicks verification link
3. Redirected to `/access` (sign-in page)
4. Signs in with email/password
5. Clerk authenticates and creates session
6. Middleware adds organization context
7. Redirected to `/dashboard`

### Existing Users
1. Go to `/access`
2. Enter email/password
3. Clerk authenticates
4. Middleware checks organization membership
5. Redirected to `/dashboard` with proper context

## Multi-Tenancy Integration

### Organization Creation
- Each SME gets a **Clerk Organization**
- Organization ID stored in `Business.clerkOrgId`
- All users in SME belong to same organization

### User Creation
- Each user gets a **Clerk User Account**
- User ID stored in `User.clerkUserId`
- Organization ID stored in `User.clerkOrgId`
- First user automatically becomes **OWNER**

### Data Isolation
- All queries filtered by `businessId` (SME)
- Users can only see data from their organization
- Role-based access controls what they can see

## API Endpoints

### Registration
```
POST /api/onboarding
Body: {
  businessName, industry, businessSize,
  firstName, lastName, email, phone,
  password, confirmPassword,
  address, city, postcode
}
Response: {
  success: true,
  message: "Registration successful! Please check your email...",
  data: { userId, businessId, organizationId, email }
}
```

## Environment Setup

Make sure these are set in `.env.local`:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_TIER_1=price_... # 1-10 users
STRIPE_PRICE_TIER_2=price_... # 11-25 users
STRIPE_PRICE_TIER_3=price_... # 26+ users
```

## User Journey

1. **Landing Page** → Click "Get Started"
2. **Onboarding** → Fill 4-step form
3. **Email Verification** → Check email, click link
4. **Sign In** → `/access` page
5. **Dashboard** → Full access to platform

## Next Steps After Registration

1. **Verify Email** (required)
2. **Complete Profile** (optional)
3. **Invite Team Members** (via Clerk organization invites)
4. **Set Up Modules** (start using invoicing, CRM, etc.)
5. **Configure Settings** (billing, preferences)

## Business Size Impact

The business size selected during onboarding determines:
- **Maximum seats** available
- **Pricing tier** (affects Stripe subscription)
- **Feature access** (Tier 2+ gets audit logs, Tier 3+ gets SSO)
- **Billing** (per-seat pricing scales automatically)

Users can upgrade/downgrade later by changing seat count, which automatically updates:
- Stripe subscription
- Max seats limit
- Feature availability

