import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
    directUrl: process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres"
  }
} as any);
