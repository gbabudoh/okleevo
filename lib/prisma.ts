import { PrismaClient } from '@prisma/client';

// Type-safe global for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  // Ensure DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please add it to your .env.local file. ' +
      'Example: DATABASE_URL="postgresql://user:password@localhost:5432/dbname"'
    );
  }

  // Validate DATABASE_URL format
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error(
      'Invalid DATABASE_URL format. ' +
      'It should start with "postgresql://" or "postgres://". ' +
      'Current value: ' + databaseUrl.substring(0, 20) + '...'
    );
  }

  // Create Prisma Client
  // Note: Using type assertion to work around Prisma 7.x engine type detection
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }) as any;

  return client;
};

// Prevent multiple instances in development
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
