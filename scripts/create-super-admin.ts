import { PrismaClient } from '@/lib/prisma-client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@okleevo.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!@#';
    const firstName = process.env.SUPER_ADMIN_FIRST_NAME || 'Super';
    const lastName = process.env.SUPER_ADMIN_LAST_NAME || 'Admin';

    console.log('Creating super admin user...');
    console.log(`Email: ${email}`);
    console.log(`Name: ${firstName} ${lastName}`);

    // Check if super admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user to super admin
      const currentRole = existingUser.role as string;
      if (currentRole !== 'SUPER_ADMIN') {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: 'SUPER_ADMIN' as any,
            password: hashedPassword,
            status: 'ACTIVE' as any,
            emailVerified: new Date(),
          } as any,
        });
        console.log('✅ Existing user updated to SUPER_ADMIN');
      } else {
        console.log('✅ Super admin user already exists');
      }
      return;
    }

    // Find or create "Platform Admin" business
    let platformBusiness = await prisma.business.findFirst({
      where: {
        name: 'Platform Administration',
      },
    });

    if (!platformBusiness) {
      platformBusiness = await prisma.business.create({
        data: {
          name: 'Platform Administration',
          industry: 'Platform',
          size: '1-5',
          country: 'UK',
          seatCount: 1,
          maxSeats: 1,
        } as any,
      });
      console.log('✅ Created Platform Administration business');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        businessId: platformBusiness.id,
        emailVerified: new Date(),
        timezone: 'Europe/London',
      } as any,
    });

    console.log('✅ Super admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔗 Admin Panel URL: http://localhost:3000/admin/access');
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

