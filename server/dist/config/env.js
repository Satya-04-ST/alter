"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load .env from server directory or root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000').transform((val) => parseInt(val, 10)),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_URL: zod_1.z.string().default('http://localhost:3000'),
    JWT_SECRET: zod_1.z.string().default('alter_super_secret_jwt_key_2026_academic_orchestrator'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    DATABASE_URL: zod_1.z.string().default('postgresql://postgres:postgres@localhost:5432/alter_db?schema=public'),
    REDIS_HOST: zod_1.z.string().default('localhost'),
    REDIS_PORT: zod_1.z.string().default('6379').transform((val) => parseInt(val, 10)),
    REDIS_PASSWORD: zod_1.z.string().optional().default(''),
    GEMINI_API_KEY: zod_1.z.string().optional().default(''),
    OPENAI_API_KEY: zod_1.z.string().optional().default(''),
    OPENROUTER_API_KEY: zod_1.z.string().optional().default(''),
    UPLOAD_DIR: zod_1.z.string().default(path_1.default.resolve(__dirname, '../../uploads')),
    MAX_FILE_SIZE_MB: zod_1.z.string().default('25').transform((val) => parseInt(val, 10)),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.warn('⚠️ Environment configuration warning:', parsed.error.format());
}
exports.env = parsed.success ? parsed.data : envSchema.parse({});
