import { PrismaClient, PlanTier, SubscriptionStatus } from '../lib/prisma-client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Updating ZenLiv Limited to Starter Workspace Plan ($39/mo, 5 seats)...');

  const business = await prisma.business.findFirst({
    where: { name: { contains: 'ZenLiv', mode: 'insensitive' } },
    include: {
      subscription: true,
      users: true,
    },
  });

  if (!business) {
    throw new Error('❌ ZenLiv Limited not found in the database!');
  }

  console.log(`Found business: ${business.name} (ID: ${business.id})`);
  console.log(`Current users: ${business.users.length}`);

  const now = new Date();
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // 1. Update Business record
  const updatedBusiness = await prisma.business.update({
    where: { id: business.id },
    data: {
      seatCount: business.users.length > 0 ? business.users.length : 1,
      maxSeats: 5, // 5 seats included for Starter Workspace
      size: '1-5',
      currency: 'USD',
      pivotNavEnabled: true,
    },
  });

  console.log('✅ Business record updated:', {
    name: updatedBusiness.name,
    maxSeats: updatedBusiness.maxSeats,
    seatCount: updatedBusiness.seatCount,
    currency: updatedBusiness.currency,
    pivotNavEnabled: updatedBusiness.pivotNavEnabled,
  });

  // 2. Update / Create Subscription record
  const subscription = await prisma.subscription.upsert({
    where: { businessId: business.id },
    create: {
      businessId: business.id,
      plan: 'Starter Workspace',
      planTier: PlanTier.STARTER,
      status: SubscriptionStatus.ACTIVE,
      amount: 3900, // $39.00 / mo in cents
      currency: 'usd',
      currentPeriodStart: now,
      currentPeriodEnd: oneMonthLater,
      cancelAtPeriodEnd: false,
      trialEnd: null,
    },
    update: {
      plan: 'Starter Workspace',
      planTier: PlanTier.STARTER,
      status: SubscriptionStatus.ACTIVE,
      amount: 3900,
      currency: 'usd',
      currentPeriodStart: now,
      currentPeriodEnd: oneMonthLater,
      cancelAtPeriodEnd: false,
      trialEnd: null,
    },
  });

  console.log('✅ Subscription record updated:', {
    id: subscription.id,
    plan: subscription.plan,
    planTier: subscription.planTier,
    status: subscription.status,
    amount: `${subscription.amount / 100} ${subscription.currency.toUpperCase()}`,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
  });

  console.log('🎉 ZenLiv Limited successfully configured on Starter Workspace tier!');
}

main()
  .catch((err) => {
    console.error('Error updating ZenLiv Limited:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
