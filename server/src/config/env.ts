import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from server directory or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().default('alter_super_secret_jwt_key_2026_academic_orchestrator'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/alter_db?schema=public'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform((val) => parseInt(val, 10)),
  REDIS_PASSWORD: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  UPLOAD_DIR: z.string().default(path.resolve(__dirname, '../../uploads')),
  MAX_FILE_SIZE_MB: z.string().default('25').transform((val) => parseInt(val, 10)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('⚠️ Environment configuration warning:', parsed.error.format());
}

export const env = parsed.success ? parsed.data : envSchema.parse({});
