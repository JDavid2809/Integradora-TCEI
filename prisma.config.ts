import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // seed: 'tsx prisma/seed.ts', // uncomment and adapt if you use tsx or other seed runner
  },
  datasource: {
    // If you prefer type safety, replace process.env with the env() helper from `prisma/config`.
    url: process.env.DATABASE_URL ?? '',
    // shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL ?? '', // set if you use a shadow DB for migrations
  },
} as any)
