/**
 * Prisma Client Singleton
 *
 * In Next.js dev mode, hot-reloads create new module instances, which
 * would open a new PrismaClient connection on every reload and exhaust
 * the database connection pool quickly.
 *
 * This pattern stores the client on the global object in development,
 * so hot-reloads reuse the same connection. In production, a single
 * instance is created at module load time.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
