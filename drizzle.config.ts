import { drizzle } from 'drizzle-orm/libsql';

const db = drizzle({ connection: {
  url: process.env.DATABASE_URL || 'file:./db.sqlite', 
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
}});