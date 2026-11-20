import { MongoClient, type Db } from "mongodb"

const DB_NAME = process.env.MONGODB_DB_NAME?.trim() || "rup-chorcha"

const uri = process.env.MONGODB_URI?.trim()

type MongoCache = {
  client?: MongoClient
  connection?: Promise<MongoClient>
}

const globalForMongo = globalThis as typeof globalThis & {
  rupChorchaMongo?: MongoCache
}

const cache: MongoCache = (globalForMongo.rupChorchaMongo ??= {})

/**
 * Shared, hot-reload-safe MongoDB connection for server-side reads and writes.
 * Better Auth owns the `user`, `session`, and `account` collections; this
 * client is only used for RupChorcha's own collections.
 */
async function getDatabase(): Promise<Db> {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.")
  }

  if (!cache.connection) {
    const client = new MongoClient(uri)
    cache.client = client
    cache.connection = client.connect()

    cache.connection.catch(() => {
      cache.connection = undefined
      cache.client = undefined
    })
  }

  const client = await cache.connection
  return client.db(DB_NAME)
}

export { DB_NAME, getDatabase }
