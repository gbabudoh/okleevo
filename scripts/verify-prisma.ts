import { PrismaClient } from '../lib/prisma-client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma connection...');
    const userCount = await prisma.user.count();
    console.log('Prisma connection successful! User count:', userCount);
    
    console.log('Testing MailboxMessage model...');
    const mailCount = await prisma.mailboxMessage.count();
    console.log('MailboxMessage model is accessible! Count:', mailCount);
    
    process.exit(0);
  } catch (error) {
    console.error('Prisma test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
