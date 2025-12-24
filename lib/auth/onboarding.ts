import { prisma } from '@/lib/prisma';
import { getBusinessSizeConfig } from '@/lib/utils/business-size';
import { syncSubscriptionWithSeats } from '@/lib/stripe/per-seat-billing';
import bcrypt from 'bcryptjs';

/**
 * Create SME organization and user during onboarding (NextAuth.js version)
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
  // Get business size configuration
  const sizeConfig = getBusinessSizeConfig(params.businessSize);
  if (!sizeConfig) {
    throw new Error('Invalid business size');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(params.password, 10);

  // Step 1: Create business record in database
  const business = await prisma.business.create({
    data: {
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

  // Step 2: Create user record in database
  const user = await prisma.user.create({
    data: {
      email: params.email,
      password: hashedPassword,
      firstName: params.firstName,
      lastName: params.lastName,
      name: `${params.firstName} ${params.lastName}`,
      phone: params.phone || null,
      emailVerified: new Date(), // Auto-verify for now (email verification can be added later)
      businessId: business.id,
      role: 'OWNER', // First user is always owner
      status: 'ACTIVE',
      timezone: 'Europe/London',
    } as any,
  });

  // Step 3: Set up subscription based on business size
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
  };
}

/**
 * Complete onboarding after email verification
 */
export async function completeOnboarding(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { business: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Update email verification status
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() } as any,
  });

  return user;
}

