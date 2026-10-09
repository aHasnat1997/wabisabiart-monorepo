import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

config();

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    // seed: 'tsx src/seed/admin.seed.js',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
