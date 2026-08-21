import { PrismaClient } from '../lib/prisma-client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Updating Egobas Limited and invoices to GBP ---');

  // Update all UK businesses or all businesses without currency to GBP
  const bizUpdate = await prisma.business.updateMany({
    where: {
      OR: [
        { name: { contains: 'Egobas', mode: 'insensitive' } },
        { country: 'UK' },
        { currency: '' },
      ],
    },
    data: {
      currency: 'GBP',
    },
  });
  console.log(`Updated businesses: ${bizUpdate.count}`);

  // Find Egobas Limited business id
  const egobas = await prisma.business.findFirst({
    where: { name: { contains: 'Egobas', mode: 'insensitive' } },
  });

  if (egobas) {
    console.log(`Found Egobas Business ID: ${egobas.id}, updating invoices to GBP`);
    const invUpdate = await prisma.invoice.updateMany({
      where: { businessId: egobas.id },
      data: { currency: 'GBP' },
    });
    console.log(`Updated invoices for Egobas: ${invUpdate.count}`);
  }

  const allInvoices = await prisma.invoice.findMany({
    select: { id: true, number: true, amount: true, currency: true, clientName: true },
  });
  console.log('Current Invoices in Database:', allInvoices);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
