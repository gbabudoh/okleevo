/**
 * Script to verify database migration is complete
 * Run with: npx tsx scripts/verify-migration.ts
 */

import { prisma } from '../lib/prisma';

async function verifyMigration() {
  console.log('🔍 Verifying database migration...\n');

  try {
    // Check if NextAuth.js tables exist
    console.log('Checking NextAuth.js tables...');
    
    const accountCount = await prisma.account.count();
    console.log(`✅ Account table exists (${accountCount} records)`);

    const sessionCount = await prisma.session.count();
    console.log(`✅ Session table exists (${sessionCount} records)`);

    const verificationTokenCount = await prisma.verificationToken.count();
    console.log(`✅ VerificationToken table exists (${verificationTokenCount} records)`);

    // Check User table structure
    console.log('\nChecking User table...');
    const userCount = await prisma.user.count();
    console.log(`✅ User table exists (${userCount} records)`);

    // Check Business table structure
    console.log('\nChecking Business table...');
    const businessCount = await prisma.business.count();
    console.log(`✅ Business table exists (${businessCount} records)`);

    // Verify User model has required fields
    console.log('\nVerifying User model fields...');
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        name: true,
        image: true,
        emailVerified: true,
        businessId: true,
        role: true,
        status: true,
      },
    });

    if (sampleUser || userCount === 0) {
      console.log('✅ User model has all required fields');
    }

    // Verify Business model has required fields
    console.log('\nVerifying Business model fields...');
    const sampleBusiness = await prisma.business.findFirst({
      select: {
        id: true,
        name: true,
        industry: true,
        size: true,
        seatCount: true,
        maxSeats: true,
      },
    });

    if (sampleBusiness || businessCount === 0) {
      console.log('✅ Business model has all required fields');
    }

    console.log('\n✅ Database migration verification complete!');
    console.log('\nAll tables are properly set up and ready to use.');

  } catch (error: any) {
    console.error('\n❌ Migration verification failed:');
    console.error(error.message);
    
    if (error.message.includes('does not exist')) {
      console.error('\n💡 Tip: Run "npx prisma db push" to create the tables.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();

