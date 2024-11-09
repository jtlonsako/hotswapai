import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: './.env' });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  // dialect: 'sqlite',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
});