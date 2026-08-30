import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env';
import { memStore } from './config/prisma';
import { initializeRedis } from './config/redis';
import { initializeDocumentQueue } from './queues/documentQueue';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/authRoutes';
import documentRoutes from './routes/documentRoutes';
import chatRoutes from './routes/chatRoutes';
import plannerRoutes from './routes/plannerRoutes';
import taskRoutes from './routes/taskRoutes';
import quizRoutes from './routes/quizRoutes';
import researchRoutes from './routes/researchRoutes';
import studyRoutes from './routes/studyRoutes';
import aggregatorRoutes from './routes/aggregatorRoutes';

const app = express();
const server = http.createServer(app);

// Socket.IO Setup for real-time presence & live streaming
export const io = new SocketIOServer(server, {
  cors: {
    origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

  socket.on('join-user-room', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`👤 [Socket.IO] User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use('/uploads', express.static(env.UPLOAD_DIR));

// API Rate Limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'ALTER AI Operations & Academic Orchestrator',
    timestamp: new Date().toISOString(),
    postgresActive: memStore.isPostgresReady,
    env: env.NODE_ENV,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes); // /api/user/profile alias
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/aggregators', aggregatorRoutes);

// Centralized Error Handler
app.use(errorHandler);

// Server Boot Sequence
async function startServer() {
  // 1. Check Database connection
  await memStore.checkDatabaseHealth();

  // 2. Initialize Redis and BullMQ
  await initializeRedis();
  initializeDocumentQueue();

  // 3. Start listening
  server.listen(env.PORT, () => {
    console.log(`
=====================================================
🚀 ALTER Backend Engine running on http://localhost:${env.PORT}
📚 Environment: ${env.NODE_ENV}
🔒 Security: Helmet, Rate-Limiters, Bcrypt(12), JWT
⚡ Document Ingestion: PDF-Parse, OCR, Chunker, pgvector
=====================================================
    `);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});

export { app, server };
