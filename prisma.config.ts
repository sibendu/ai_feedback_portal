import { defineConfig, env } from "prisma/config";

// Next.js loads .env.local automatically, but Prisma CLI only reads its config.
// Load the project-local secrets before resolving the datasource for CLI commands.
if (!process.env.DATABASE_URL) process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: env("DATABASE_URL")
  }
});
