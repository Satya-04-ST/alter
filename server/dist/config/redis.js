"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeRedis = exports.redisClient = exports.isRedisConnected = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
exports.isRedisConnected = false;
exports.redisClient = new ioredis_1.default({
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
    password: env_1.env.REDIS_PASSWORD || undefined,
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
exports.redisClient.on('connect', () => {
    exports.isRedisConnected = true;
    console.log('✅ Connected to Redis successfully.');
});
exports.redisClient.on('error', (err) => {
    exports.isRedisConnected = false;
    // Silently handle connection error in dev to avoid uncaught exceptions
});
const initializeRedis = async () => {
    try {
        await exports.redisClient.connect();
        exports.isRedisConnected = true;
    }
    catch (err) {
        exports.isRedisConnected = false;
        console.warn('ℹ️ Redis not reachable. Using in-memory synchronous job pipeline fallback.');
    }
};
exports.initializeRedis = initializeRedis;
