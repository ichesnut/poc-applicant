// Prisma client singleton for server-side usage.
// Requires DATABASE_URL to be set in .env and a running PostgreSQL instance.
// Run `pnpm db:generate` after schema changes.
//
// Usage: import { prisma } from "@/lib/db";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

// Invalidate cached client if the schema has changed (e.g. after prisma generate)
// by checking that expected model accessors exist on the cached instance.
if (globalForPrisma.prisma && !("document" in globalForPrisma.prisma)) {
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
