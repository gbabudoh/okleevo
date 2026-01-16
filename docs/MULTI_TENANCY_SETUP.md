# Multi-User Multi-Tenancy Setup Guide

This guide explains how to use the multi-user, multi-tenant architecture implemented in Okleevo.

## Architecture Overview

Okleevo uses a **multi-tenant architecture** where:
- Each **SME (Small/Medium Enterprise)** is a **Tenant** (Organization)
- Each **User** belongs to one SME
- Data is isolated by `smeId` (organization) and `userId` (individual)

## Key Components

### 1. Clerk Integration

Clerk handles authentication and organization management:

```typescript
// Middleware automatically protects routes
// See: middleware.ts

// Get current user and organization
import { getCurrentUser, getCurrentOrg } from '@/lib/clerk/multi-tenancy';

const user = await getCurrentUser();
const org = await getCurrentOrg();
```

### 2. Data Isolation

Every database query automatically filters by SME and user:

```typescript
import { getDataIsolationFilter } from '@/lib/clerk/multi-tenancy';

const filter = getDataIsolationFilter(userId, smeId, userRole);
// Returns: { smeId, businessId, userId? } based on role
```

**Role-based access:**
- **MEMBER**: Can only see their own data (`userId` filter applied)
- **ADMIN/OWNER**: Can see all SME data (no `userId` filter)

### 3. RBAC (Role-Based Access Control)

```typescript
import { hasPermission } from '@/lib/clerk/rbac';

if (hasPermission(userRole, 'invoices', 'delete')) {
  // User can delete invoices
}
```

**Roles:**
- **OWNER**: Full access to everything
- **ADMIN**: Can manage users, settings, billing
- **MANAGER**: Can see team data (Tier 3 feature)
- **MEMBER**: Can only see own data

### 4. Tier System

Features unlock based on seat count:

- **Tier 1 (1-10 users)**: Basic features, individual data
- **Tier 2 (11-20 users)**: Audit logs, shared workspaces, admin dashboard
- **Tier 3 (21+ users)**: SSO, SCIM, custom roles

```typescript
import { getUserTier, isFeatureAvailable } from '@/lib/clerk/rbac';

const tier = getUserTier(seatCount);
if (isFeatureAvailable('audit-logs', tier)) {
  // Feature available
}
```

## Usage Examples

### Creating an API Route with Multi-Tenancy

```typescript
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (req, { user, org, dataFilter }) => {
  // dataFilter automatically includes smeId and userId (if MEMBER)
  const invoices = await prisma.invoice.findMany({
    where: dataFilter,
  });
  
  return NextResponse.json({ data: invoices });
});
```

### Creating an API Route with RBAC

```typescript
import { withRBAC } from '@/lib/api/with-multi-tenancy';

export const DELETE = withRBAC(
  'invoices',  // resource
  'delete',    // action
  async (req, { user, org, dataFilter }) => {
    // User has permission to delete invoices
    // ... delete logic
  }
);
```

### Using Audit Logs (Tier 2+)

```typescript
import { createAuditLog } from '@/lib/clerk/audit-log';

await createAuditLog({
  action: 'UPDATE',
  resourceType: 'Invoice',
  resourceId: invoice.id,
  changes: { before: oldData, after: newData },
});
```

### Workspace Visibility (Tier 2+)

```typescript
import { setResourceVisibility, canUserAccessResource } from '@/lib/clerk/workspace-visibility';

// Make a resource shared
await setResourceVisibility({
  resourceType: 'Invoice',
  resourceId: invoice.id,
  smeId: user.smeId,
  visibility: 'SHARED',
  sharedWithUserIds: [], // Empty = all users in SME
});

// Check access
const canAccess = await canUserAccessResource({
  resourceType: 'Invoice',
  resourceId: invoice.id,
  userId: user.id,
  userRole: user.role,
});
```

### Per-Seat Billing with Stripe

```typescript
import { syncSubscriptionWithSeats } from '@/lib/stripe/per-seat-billing';

// When user count changes
await syncSubscriptionWithSeats(businessId, newSeatCount);
```

## Environment Variables

Add these to your `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe (for per-seat billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_TIER_1=price_... # 1-10 users
STRIPE_PRICE_TIER_2=price_... # 11-20 users
STRIPE_PRICE_TIER_3=price_... # 21+ users
```

## Database Migration

After updating the schema, run:

```bash
npm run prisma:generate
npm run prisma:migrate dev --name add_clerk_multi_tenancy
```

## Next Steps

1. **Set up Clerk Dashboard**: Create an organization in Clerk
2. **Configure Stripe Products**: Create per-seat pricing tiers
3. **Update existing API routes**: Use `withMultiTenancy` wrapper
4. **Add team invitation UI**: Use Clerk's organization invitation system
5. **Implement admin dashboard**: Show usage stats for Tier 2+

## File Structure

```
lib/
  clerk/
    multi-tenancy.ts      # Core multi-tenancy utilities
    rbac.ts               # Role-based access control
    audit-log.ts          # Audit logging (Tier 2+)
    workspace-visibility.ts # Shared/private workspaces (Tier 2+)
  stripe/
    per-seat-billing.ts   # Stripe per-seat billing
  api/
    with-multi-tenancy.ts  # API route wrappers
middleware.ts             # Clerk middleware
prisma/
  schema.prisma           # Updated schema with Clerk fields
```

## Security Notes

1. **Always use `withMultiTenancy`** wrapper for API routes
2. **Never trust client-side data** - always verify `smeId` server-side
3. **Use RBAC** for permission checks
4. **Audit sensitive actions** (Tier 2+)
5. **Validate data isolation** in all queries

