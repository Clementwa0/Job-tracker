import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so it doesn't get Next's .env loading.
// Load the same files Next would (.env.local wins over .env; variables that
// are already set in the shell win over both). Missing files are fine.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    /* file not present */
  }
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  dbCredentials: {
    url: DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
