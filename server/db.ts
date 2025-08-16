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

// Use SQLite for local development if DATABASE_URL contains 'sqlite'
if (process.env.DATABASE_URL.includes('sqlite')) {
  const sqlite = new Database(process.env.DATABASE_URL.replace('sqlite:', ''));
  export const db = drizzleSqlite(sqlite, { schema });
  export const pool = null; // Not needed for SQLite
} else {
  export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  export const db = drizzle({ client: pool, schema });
}