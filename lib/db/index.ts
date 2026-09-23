import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

type DbGlobal = {
  queryClient?: postgres.Sql;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

const globalForDb = globalThis as unknown as DbGlobal;

const queryClient =
  globalForDb.queryClient ??
  postgres(DATABASE_URL, {
    max: 5,

    // Neon connection settings
    prepare: false,
    ssl: "require",

    connect_timeout: 15,
    idle_timeout: 20,

    // Better error visibility
    onnotice: () => {},
  });

export const db =
  globalForDb.db ?? drizzle(queryClient, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.queryClient = queryClient;
  globalForDb.db = db;
}