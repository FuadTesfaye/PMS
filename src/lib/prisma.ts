import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const defaultDbUrl = "postgresql://postgres:postgres@localhost:5432/postgres";
const rawDatabaseUrl = process.env.DATABASE_URL ?? defaultDbUrl;
const databaseUrl =
  rawDatabaseUrl.startsWith("prisma+postgres://") ? process.env.DIRECT_DATABASE_URL ?? defaultDbUrl : rawDatabaseUrl;
const adapter = new PrismaPg(new Pool({ connectionString: databaseUrl }));

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
