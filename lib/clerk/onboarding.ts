import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getBusinessSizeConfig } from '@/lib/utils/business-size';
import { syncSubscriptionWithSeats } from '@/lib/stripe/per-seat-billing';

/**
 * Create SME organization and user during onboarding
 */
export async function createSMEOnboarding(params: {
  businessName: string;
  industry: string;
  businessSize: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  address?: string;
  city?: string;
  postcode?: string;
}) {
  const clerk = await clerkClient();
  
  // Get business size configuration
  const sizeConfig = getBusinessSizeConfig(params.businessSize);
  if (!sizeConfig) {
    throw new Error('Invalid business size');
  }

  // Step 1: Create Clerk user
  const clerkUser = await clerk.users.createUser({
    emailAddress: [params.email],
    firstName: params.firstName,
    lastName: params.lastName,
    phoneNumber: params.phone ? [params.phone] : undefined,
    password: params.password,
    skipPasswordChecks: false,
    skipPasswordRequirement: false,
  });

  // Step 2: Create Clerk organization
  const organization = await clerk.organizations.createOrganization({
    name: params.businessName,
    createdBy: clerkUser.id,
    slug: params.businessName.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50),
  });

  // Step 3: Create business record in database
  // Note: Using type assertion because Prisma's generated types don't always
  // properly recognize fields with unique constraints during creation
  const business = await prisma.business.create({
    data: {
      clerkOrgId: organization.id,
      name: params.businessName,
      industry: params.industry,
      size: params.businessSize,
      address: params.address || undefined,
      city: params.city || undefined,
      postcode: params.postcode || undefined,
      country: 'UK',
      seatCount: sizeConfig.defaultSeatCount,
      maxSeats: sizeConfig.maxSeats,
    } as any,
  });

  // Step 4: Create user record in database
  // Note: Using type assertion because Prisma's generated types don't always
  // properly recognize fields with unique constraints during creation
  const user = await prisma.user.create({
    data: {
      clerkUserId: clerkUser.id,
      clerkOrgId: organization.id,
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      phone: params.phone || null,
      emailVerified: false, // Will be verified via email
      businessId: business.id,
      role: 'OWNER', // First user is always owner
      status: 'ACTIVE',
      timezone: 'Europe/London',
    } as any,
  });

  // Step 5: Set up subscription based on business size
  // This will create Stripe customer and subscription
  // Note: We don't fail registration if Stripe setup fails - can be done later
  try {
    await syncSubscriptionWithSeats(business.id, sizeConfig.defaultSeatCount);
  } catch (error) {
    console.error('Failed to set up subscription (non-critical):', error);
    // Continue with registration even if Stripe setup fails
  }

  return {
    user,
    business,
    organization,
    clerkUser,
  };
}

/**
 * Complete onboarding after email verification
 */
export async function completeOnboarding(clerkUserId: string) {
  // Note: Using type assertion because Prisma's generated types don't always
  // properly recognize unique fields in where clauses
  const user = await prisma.user.findUnique({
    where: { clerkUserId } as any,
    include: { business: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Update email verification status
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  return user;
}

