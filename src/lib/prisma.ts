import { PrismaClient } from '@prisma/client';
import retry from 'async-retry';

// Prevent multiple PrismaClient instances during dev hot-reload.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Add retry logic for connection failures
  const originalConnect = client.$connect.bind(client);
  client.$connect = async () => {
    return retry(
      async () => {
        try {
          await originalConnect();
        } catch (e) {
          console.warn('Prisma: connection failed, retrying...', e);
          throw e;
        }
      },
      {
        retries: 5,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 10000,
        onRetry: (err) => console.warn('Prisma: retrying connection...', err),
      }
    );
  };

  return client;
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
