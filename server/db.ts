import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Use DATABASE_URL from environment or fallback for development
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/bonushunter';

// Create postgres connection with retry logic and better timeouts
const client = postgres(connectionString, {
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
  transform: postgres.camel,
  onnotice: () => {}, // Suppress notices
  prepare: false, // Disable prepared statements for better compatibility
});

// Create drizzle database instance
export const db = drizzle(client, { schema });

export type Database = typeof db;