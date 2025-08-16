
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { Pool } from 'pg';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let db: any;
let pool: Pool | null = null;

// Use SQLite for local development if DATABASE_URL contains 'sqlite'
if (process.env.DATABASE_URL.includes('sqlite')) {
  const sqlite = new Database(process.env.DATABASE_URL.replace('sqlite:', ''));
  db = drizzleSqlite(sqlite, { schema });
  pool = null; // Not needed for SQLite
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { db, pool };
