import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifySuperAdmin() {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@okleevo.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!@#';

    console.log('Verifying super admin user...');
    console.log(`Email: ${email}\n`);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        business: true,
      },
    });

    if (!user) {
      console.log('❌ User not found!');
      console.log('\nPlease create the super admin first:');
      console.log('1. Use the API endpoint: POST /api/admin/create-super-admin');
      console.log('2. Or run: npm run create-super-admin');
      return;
    }

    console.log('✅ User found!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Business: ${user.business?.name || 'N/A'}`);
    console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);

    if (!user.password) {
      console.log('\n❌ User has no password set!');
      console.log('Updating password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          emailVerified: new Date(),
        } as any,
      });
      console.log('✅ Password set successfully!');
    } else {
      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        console.log('\n✅ Password is valid!');
      } else {
        console.log('\n❌ Password does not match!');
        console.log('Updating password to match expected value...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
          },
        });
        console.log('✅ Password updated successfully!');
      }
    }

    // Check if role is SUPER_ADMIN
    const currentRole = user.role as string;
    if (currentRole !== 'SUPER_ADMIN') {
      console.log(`\n⚠️  User role is "${user.role}", updating to SUPER_ADMIN...`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'SUPER_ADMIN' as any,
        },
      });
      console.log('✅ Role updated to SUPER_ADMIN!');
    }

    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔗 Admin Panel URL: http://localhost:3000/admin/access');
  } catch (error) {
    console.error('❌ Error verifying super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
verifySuperAdmin()
  .then(() => {
    console.log('\n✨ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

