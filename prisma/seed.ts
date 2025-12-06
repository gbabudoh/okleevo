import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo business
  const business = await prisma.business.create({
    data: {
      name: 'Demo Business Ltd',
      industry: 'professional-services',
      size: '6-10',
      address: '123 High Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'UK',
    },
  });

  console.log('✅ Created demo business');

  // Create subscription
  const subscription = await prisma.subscription.create({
    data: {
      businessId: business.id,
      status: 'TRIAL',
      plan: 'all-in-one',
      amount: 1999,
      currency: 'gbp',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created subscription');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'demo@okleevo.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      phone: '07123456789',
      emailVerified: true,
      role: 'OWNER',
      status: 'ACTIVE',
      businessId: business.id,
    },
  });

  console.log('✅ Created demo user (email: demo@okleevo.com, password: demo123)');

  // Create sample contacts
  await prisma.contact.createMany({
    data: [
      {
        businessId: business.id,
        userId: user.id,
        name: 'John Smith',
        email: 'john@abc.com',
        phone: '07123456789',
        company: 'ABC Ltd',
        status: 'ACTIVE',
      },
      {
        businessId: business.id,
        userId: user.id,
        name: 'Jane Doe',
        email: 'jane@xyz.com',
        phone: '07987654321',
        company: 'XYZ Corp',
        status: 'LEAD',
      },
    ],
  });

  console.log('✅ Created sample contacts');

  // Create sample invoices
  await prisma.invoice.createMany({
    data: [
      {
        businessId: business.id,
        userId: user.id,
        number: 'INV-1001',
        clientName: 'ABC Ltd',
        clientEmail: 'john@abc.com',
        amount: 1250.00,
        currency: 'GBP',
        status: 'PAID',
        items: JSON.stringify([
          { description: 'Consulting Services', quantity: 10, rate: 125, amount: 1250 }
        ]),
        dueDate: new Date('2024-12-31'),
        paidAt: new Date('2024-12-01'),
      },
      {
        businessId: business.id,
        userId: user.id,
        number: 'INV-1002',
        clientName: 'XYZ Corp',
        clientEmail: 'jane@xyz.com',
        amount: 850.50,
        currency: 'GBP',
        status: 'PENDING',
        items: JSON.stringify([
          { description: 'Web Development', quantity: 5, rate: 170.10, amount: 850.50 }
        ]),
        dueDate: new Date('2025-01-15'),
      },
    ],
  });

  console.log('✅ Created sample invoices');

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        businessId: business.id,
        userId: user.id,
        title: 'Review Q4 financial reports',
        description: 'Analyze financial data and prepare summary',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        businessId: business.id,
        userId: user.id,
        title: 'Follow up with ABC Ltd',
        description: 'Check on project progress',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created sample tasks');

  // Create sample expenses
  await prisma.expense.createMany({
    data: [
      {
        businessId: business.id,
        userId: user.id,
        description: 'Office Supplies',
        amount: 125.50,
        currency: 'GBP',
        category: 'Supplies',
        date: new Date(),
      },
      {
        businessId: business.id,
        userId: user.id,
        description: 'Software License',
        amount: 299.00,
        currency: 'GBP',
        category: 'Software',
        date: new Date(),
      },
    ],
  });

  console.log('✅ Created sample expenses');

  // Create sample inventory items
  await prisma.inventoryItem.createMany({
    data: [
      {
        businessId: business.id,
        name: 'Product A',
        sku: 'SKU-001',
        description: 'Premium product',
        quantity: 150,
        minQuantity: 20,
        price: 49.99,
        cost: 25.00,
        category: 'Electronics',
        status: 'IN_STOCK',
      },
      {
        businessId: business.id,
        name: 'Product B',
        sku: 'SKU-002',
        description: 'Standard product',
        quantity: 5,
        minQuantity: 10,
        price: 29.99,
        cost: 15.00,
        category: 'Accessories',
        status: 'LOW_STOCK',
      },
    ],
  });

  console.log('✅ Created sample inventory items');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('   Email: demo@okleevo.com');
  console.log('   Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
