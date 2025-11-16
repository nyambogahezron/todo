import { PrismaClient } from '@prisma/client';
import { Platform } from 'react-native';

// Singleton Prisma Client instance
let prisma: PrismaClient | null = null;

// Get the database path for SQLite
// For Prisma with React Native, the database URL is set in the schema
// and Prisma will handle the file path automatically
const getDatabaseUrl = (): string => {
  // The URL is defined in schema.prisma, but we can override if needed
  // For local-first, we use a relative path that Prisma will resolve
  return 'file:./app.db';
};

// Initialize Prisma Client
export const getPrismaClient = (): PrismaClient => {
  if (prisma) {
    return prisma;
  }

  prisma = new PrismaClient({
    log: __DEV__ ? ['query', 'error', 'warn'] : ['error'],
  });

  return prisma;
};

// Initialize database connection
export const initializeDatabase = async (): Promise<PrismaClient> => {
  try {
    const client = getPrismaClient();
    // Test the connection
    await client.$connect();
    console.log('✅ Database connected successfully');
    return client;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};

// Cleanup function
export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};

// Export a synchronous getter (for use after initialization)
export const getDb = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return prisma;
};

// Export the client as default
export default getPrismaClient;

