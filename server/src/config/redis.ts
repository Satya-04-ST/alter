import Redis from 'ioredis';
import { env } from './env';

export let isRedisConnected = false;

const cleanHost = (env.REDIS_HOST || 'localhost')
  .replace(/^https?:\/\//, '')
  .replace(/^rediss?:\/\//, '')
  .split(':')[0];

const isTlsRequired = cleanHost.includes('upstash.io') || cleanHost.includes('rediss');

export const redisClient = new Redis({
  host: cleanHost,
  port: env.REDIS_PORT || 6379,
  password: env.REDIS_PASSWORD || undefined,
  tls: isTlsRequired ? { rejectUnauthorized: false } : undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    if (times > 3) {
      return null; // Stop retrying after 3 attempts in local dev
    }
    return Math.min(times * 200, 1000);
  },
  lazyConnect: true,
});

redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log('✅ Connected to Redis successfully.');
});

redisClient.on('error', (err) => {
  isRedisConnected = false;
  // Silently handle connection error in dev to avoid uncaught exceptions
});

export const initializeRedis = async () => {
  try {
    await redisClient.connect();
    isRedisConnected = true;
  } catch (err) {
    isRedisConnected = false;
    console.warn('ℹ️ Redis not reachable. Using in-memory synchronous job pipeline fallback.');
  }
};
