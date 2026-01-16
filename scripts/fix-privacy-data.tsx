import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- DATA CORRECTION START ---');

  // 1. Ensure Egobas Limited exists and has correct limits
  let egobasBySearch = await prisma.business.findFirst({ where: { name: 'Egobas Limited' } });
  
  if (egobasBySearch) {
    await prisma.business.update({
      where: { id: egobasBySearch.id },
      data: { seatCount: 2, maxSeats: 5, size: '1-5' }
    });
    console.log('Updated Egobas Limited:', egobasBySearch.id);
  } else {
    egobasBySearch = await prisma.business.create({
      data: {
        name: 'Egobas Limited',
        industry: 'technology',
        size: '1-5',
        seatCount: 2,
        maxSeats: 5,
      }
    });
    console.log('Created Egobas Limited:', egobasBySearch.id);
  }

  // 2. Ensure ZenLiv Limited exists and has correct limits
  let zenliv = await prisma.business.findFirst({ where: { name: 'ZenLiv Limited' } });
  if (zenliv) {
    await prisma.business.update({
      where: { id: zenliv.id },
      data: { seatCount: 1, maxSeats: 10, size: '1-10' }
    });
    console.log('Updated ZenLiv Limited:', zenliv.id);
  } else {
    zenliv = await prisma.business.create({
      data: {
        name: 'ZenLiv Limited',
        industry: 'technology',
        size: '1-10',
        seatCount: 1,
        maxSeats: 10,
      }
    });
    console.log('Created ZenLiv Limited:', zenliv.id);
  }

  // 3. Update/Create Users for Egobas
  const egobasUsers = [
    { email: 'godwin@egobas.com', firstName: 'Godwin', lastName: 'Babs' },
    { email: 'gbabudoh@gmail.com', firstName: 'Ebi', lastName: 'Babs' }
  ];

  for (const u of egobasUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { businessId: egobasBySearch.id },
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        businessId: egobasBySearch.id,
        role: UserRole.OWNER,
      }
    });
    console.log('Ensured Egobas User:', u.email);
  }

  // 4. Update/Create Users for ZenLiv
  const zenlivUsers = [
    { email: 'info@nigerdeltaconsortium.com', firstName: 'Deli', lastName: 'Logan' }
  ];

  for (const u of zenlivUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { businessId: zenliv.id },
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        businessId: zenliv.id,
        role: UserRole.OWNER,
      }
    });
    console.log('Ensured ZenLiv User:', u.email);
  }

  console.log('--- DATA CORRECTION COMPLETE ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
