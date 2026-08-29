/**
 * Request rate limiting.
 *
 * The original implementation kept counters in a plain in-memory Map. That
 * works for a single process, but the moment this app runs as more than one
 * instance (multiple containers/replicas behind a load balancer - the normal
 * way to scale a Node service), each instance tracks its own counters, so the
 * *effective* limit silently multiplies by the number of instances. This
 * module keeps the zero-dependency in-memory behavior for local/single
 * instance use, but transparently switches to a shared Redis-backed counter
 * (one counter per key, visible to every instance) whenever REDIS_URL is set.
 */
import type { NextFunction, Request, Response } from 'express';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  /** Function to derive the bucket key for a request (defaults to client IP). */
  keyFn?: (req: Request) => string;
  message?: string;
}

interface RateLimitStore {
  /** Increments the counter for `key` and returns the new count for the current window. */
  increment(key: string, windowMs: number): Promise<number>;
}

class InMemoryStore implements RateLimitStore {
  private counts = new Map<string, { count: number; resetAt: number }>();

  async increment(key: string, windowMs: number): Promise<number> {
    const now = Date.now();
    const current = this.counts.get(key);
    if (!current || current.resetAt <= now) {
      this.counts.set(key, { count: 1, resetAt: now + windowMs });
      return 1;
    }
    current.count += 1;
    return current.count;
  }
}

class RedisStore implements RateLimitStore {
  constructor(private readonly redis: import('ioredis').Redis) {}

  async increment(key: string, windowMs: number): Promise<number> {
    const redisKey = `ratelimit:${key}`;
    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.pexpire(redisKey, windowMs);
    }
    return count;
  }
}

let sharedStorePromise: Promise<RateLimitStore> | null = null;

async function getStore(): Promise<RateLimitStore> {
  if (sharedStorePromise) return sharedStorePromise;

  sharedStorePromise = (async () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return new InMemoryStore();
    }
    try {
      const { default: Redis } = await import('ioredis');
      const client = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
      client.on('error', (err) => {
        console.error('[rate-limiter] Redis connection error, falling back to in-memory limiting:', err.message);
      });
      await client.connect();
      console.log('[rate-limiter] Using shared Redis-backed rate limiting.');
      return new RedisStore(client);
    } catch (err) {
      console.warn('[rate-limiter] Could not connect to REDIS_URL, falling back to in-memory (per-instance) rate limiting:', err);
      return new InMemoryStore();
    }
  })();

  return sharedStorePromise;
}

export function createRateLimiter(options: RateLimitOptions) {
  const keyFn = options.keyFn || ((req: Request) => req.ip || req.socket.remoteAddress || 'unknown');

  return async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await getStore();
      const key = keyFn(req);
      const count = await store.increment(key, options.windowMs);
      if (count > options.max) {
        return res.status(429).json({ error: options.message || 'Too many requests' });
      }
      next();
    } catch (err) {
      // Never let a rate-limiter failure take down the whole API.
      console.error('[rate-limiter] Unexpected error, allowing request through:', err);
      next();
    }
  };
}
