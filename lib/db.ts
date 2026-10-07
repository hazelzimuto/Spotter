import { PrismaClient } from '@prisma/client'

/**
 * Prisma client singleton.
 *
 * Next.js hot-reloads modules in development, which would otherwise open a new
 * connection pool on every edit until Postgres refuses new connections.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)

export const db: PrismaClient = hasDatabaseUrl
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : (new Proxy({} as PrismaClient, {
      get(_target, prop) {
        throw new Error(
          `Prisma query db.${String(prop)} was called without DATABASE_URL configured in the environment.`
        )
      },
    }))

if (process.env.NODE_ENV !== 'production' && hasDatabaseUrl) {
  globalForPrisma.prisma = db
}
