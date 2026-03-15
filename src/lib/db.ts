// Prisma client singleton for server-side usage.
// Requires DATABASE_URL to be set in .env and a running PostgreSQL instance.
// Run `pnpm db:generate` after schema changes.
//
// Usage: import { prisma } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@/generated/prisma/client");

const globalForPrisma = globalThis as unknown as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
