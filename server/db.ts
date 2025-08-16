
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

try {
  // Use SQLite for local development if DATABASE_URL contains 'sqlite'
  if (process.env.DATABASE_URL.includes('sqlite')) {
    const sqlite = new Database(process.env.DATABASE_URL.replace('sqlite:', ''));
    db = drizzleSqlite(sqlite, { schema });
    pool = null; // Not needed for SQLite
  } else {
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      statement_timeout: 10000,
      query_timeout: 10000,
    });
    db = drizzle({ client: pool, schema });
  }
} catch (error) {
  console.error('Database connection error:', error);
  throw new Error('Failed to connect to database');
}

export { db, pool };
