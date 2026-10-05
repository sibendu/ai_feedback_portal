import { defineConfig } from "prisma/config";

// Next.js loads .env.local automatically, but the Prisma CLI runs before that
// startup path. Read a local developer configuration when it is present.
if (!process.env.DATABASE_URL) process.loadEnvFile(".env.local");

// `prisma generate` and schema validation do not connect to PostgreSQL, but
// Prisma still needs a syntactically valid datasource URL to load this config.
// A deliberately unreachable local URL lets a fresh AI Factory worktree run
// those offline checks without copying .env.local or database credentials.
// Commands that need a database (migrate, deploy, or application startup) must
// still provide DATABASE_URL explicitly.
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://prisma:prisma@127.0.0.1:1/prisma?connect_timeout=1";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: databaseUrl
  }
});
