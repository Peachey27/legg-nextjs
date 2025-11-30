import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Create database connection lazily to handle missing env vars during build
function createDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    // Return a proxy that throws helpful errors at runtime
    return new Proxy({} as ReturnType<typeof drizzle>, {
      get() {
        throw new Error(
          'DATABASE_URL environment variable is not set. ' +
          'Please create a .env.local file with your Neon connection string.'
        );
      },
    });
  }

  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export const db = createDb();

export * from './schema';
