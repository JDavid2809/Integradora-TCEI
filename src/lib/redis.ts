import Redis from 'ioredis'
import { RedisOptions } from 'ioredis'

const globalForRedis = global as unknown as { redis: Redis }

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

const redisOptions: RedisOptions = {
  connectTimeout: 3000,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  // Use reconnect strategy: linear backoff up to ~5 seconds
  retryStrategy(times: number) {
    const delay = Math.min(50 * times, 5000)
    return delay
  },
  lazyConnect: true,
  // Do not keep a long offline queue - fail fast and let API handle retries
  enableOfflineQueue: false,
}

export const redis = globalForRedis.redis || new Redis(redisUrl, redisOptions)
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Attach error handler to avoid Unhandled error events from ioredis
redis.on('error', (err: any) => {
  // Keep it simple: log and allow code to handle failures via try/catch
  // Avoid rethrowing to prevent Unhandled error in Node process
  console.error('[ioredis] error event:', (err as any)?.message || err)
})

// Optional: log when connected/disconnected
redis.on('connect', () => console.log('[ioredis] connected'))
redis.on('ready', () => console.log('[ioredis] ready'))
redis.on('close', () => console.log('[ioredis] connection closed'))

export async function safePublish(channel: string, message: string) {
  try {
    if (!redis.status || redis.status !== 'ready') {
      // Attempt to connect synchronously if possible
      await redis.connect().catch(() => {})
    }
    await redis.publish(channel, message)
    return true
  } catch (err: any) {
    console.warn('[ioredis] publish error:', (err as any)?.message || err)
    return false
  }
}
