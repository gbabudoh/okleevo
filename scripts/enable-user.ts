import { PrismaClient } from '../lib/prisma-client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function enableUser() {
  const email = 'info@egobas.com';
  const password = 'g1vemeaces2026';

  try {
    console.log(`Looking up user: ${email}`);

    const existing = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing) {
      console.log(`Found user: ${existing.firstName} ${existing.lastName} (${existing.role})`);
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: hashedPassword,
          status: 'ACTIVE',
          emailVerified: existing.emailVerified ?? new Date(),
        } as any,
      });
      console.log('✅ Password updated and account set to ACTIVE');
      console.log(`   Business: ${existing.business?.name ?? 'none'}`);
    } else {
      console.log('User not found. Creating business and user...');

      const business = await prisma.business.create({
        data: {
          name: 'Egobas',
          industry: 'General',
          size: '1-5',
          country: 'UK',
          seatCount: 1,
          maxSeats: 5,
        } as any,
      });

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Info',
          lastName: 'Egobas',
          name: 'Info Egobas',
          role: 'OWNER',
          status: 'ACTIVE',
          businessId: business.id,
          emailVerified: new Date(),
          timezone: 'Europe/London',
        } as any,
      });

      console.log('✅ New user and business created');
    }

    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Login at: http://localhost:3000/access');
  } catch (err) {
    console.error('❌ Error:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

enableUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
