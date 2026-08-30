import Redis from 'ioredis';
export declare let isRedisConnected: boolean;
export declare const redisClient: Redis;
export declare const initializeRedis: () => Promise<void>;
