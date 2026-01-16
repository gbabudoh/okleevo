# NextAuth.js Migration Guide

## ✅ Completed Steps

1. ✅ Removed Clerk dependencies
2. ✅ Installed NextAuth.js v5 beta
3. ✅ Updated Prisma schema for NextAuth.js (Account, Session, VerificationToken models)
4. ✅ Created NextAuth.js configuration (`lib/auth.ts`)
5. ✅ Created NextAuth.js API route (`app/api/auth/[...nextauth]/route.ts`)
6. ✅ Updated middleware to use NextAuth.js
7. ✅ Updated login page (`app/access/page.tsx`) to use NextAuth.js
8. ✅ Updated root layout to use NextAuth SessionProvider

## 🔄 Remaining Steps

### 1. Update Onboarding Flow
- Update `lib/clerk/onboarding.ts` → `lib/auth/onboarding.ts`
- Hash passwords with bcrypt before saving
- Remove Clerk organization creation
- Create business and user directly

### 2. Update Multi-Tenancy Utilities
- Update `lib/clerk/multi-tenancy.ts` → `lib/auth/multi-tenancy.ts`
- Remove Clerk-specific code
- Use NextAuth.js session for user context

### 3. Update API Routes
- Remove Clerk auth checks
- Use NextAuth.js `auth()` function instead

### 4. Database Migration
- Run Prisma migration to add NextAuth.js tables
- Remove `clerkUserId` and `clerkOrgId` fields (optional, can keep for migration period)

## Environment Variables Needed

Add to `.env.local`:
```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

Generate secret:
```bash
openssl rand -base64 32
```

## Next Steps

1. Run database migration: `npx prisma migrate dev --name add_nextauth_tables`
2. Update onboarding flow
3. Update multi-tenancy utilities
4. Test authentication flow
5. Remove all Clerk references

