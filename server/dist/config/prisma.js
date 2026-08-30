"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memStore = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("./env");
// Global declaration to prevent multiple Prisma instances during hot-reload
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: env_1.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
if (env_1.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
class InMemStore {
    users = new Map();
    documents = new Map();
    chunks = new Map();
    courses = new Map();
    schedules = new Map();
    tasks = new Map();
    quizzes = new Map();
    quizAttempts = new Map();
    isPostgresReady = false;
    async checkDatabaseHealth() {
        try {
            await exports.prisma.$queryRaw `SELECT 1`;
            this.isPostgresReady = true;
            console.log('✅ Connected to PostgreSQL database with Prisma.');
            return true;
        }
        catch (err) {
            this.isPostgresReady = false;
            console.warn('ℹ️ PostgreSQL database connection not detected. Using high-performance in-memory persistence fallback for development.');
            return false;
        }
    }
}
exports.memStore = new InMemStore();
