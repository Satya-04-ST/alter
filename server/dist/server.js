"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const redis_1 = require("./config/redis");
const documentQueue_1 = require("./queues/documentQueue");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const errorHandler_1 = require("./middlewares/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const plannerRoutes_1 = __importDefault(require("./routes/plannerRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const researchRoutes_1 = __importDefault(require("./routes/researchRoutes"));
const studyRoutes_1 = __importDefault(require("./routes/studyRoutes"));
const aggregatorRoutes_1 = __importDefault(require("./routes/aggregatorRoutes"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// Socket.IO Setup for real-time presence & live streaming
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: [env_1.env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    },
});
exports.io.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);
    socket.on('join-user-room', (userId) => {
        socket.join(`user:${userId}`);
        console.log(`👤 [Socket.IO] User ${userId} joined room`);
    });
    socket.on('disconnect', () => {
        console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
    });
});
// Middlewares
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, cors_1.default)({
    origin: [env_1.env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
app.use('/uploads', express_1.default.static(env_1.env.UPLOAD_DIR));
// API Rate Limiting
app.use('/api', rateLimiter_1.apiLimiter);
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'online',
        platform: 'ALTER AI Operations & Academic Orchestrator',
        timestamp: new Date().toISOString(),
        postgresActive: prisma_1.memStore.isPostgresReady,
        env: env_1.env.NODE_ENV,
    });
});
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/user', authRoutes_1.default); // /api/user/profile alias
app.use('/api/documents', documentRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/planner', plannerRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/quiz', quizRoutes_1.default);
app.use('/api/research', researchRoutes_1.default);
app.use('/api/study', studyRoutes_1.default);
app.use('/api/aggregators', aggregatorRoutes_1.default);
// Centralized Error Handler
app.use(errorHandler_1.errorHandler);
// Server Boot Sequence
async function startServer() {
    // 1. Check Database connection
    await prisma_1.memStore.checkDatabaseHealth();
    // 2. Initialize Redis and BullMQ
    await (0, redis_1.initializeRedis)();
    (0, documentQueue_1.initializeDocumentQueue)();
    // 3. Start listening
    server.listen(env_1.env.PORT, () => {
        console.log(`
=====================================================
🚀 ALTER Backend Engine running on http://localhost:${env_1.env.PORT}
📚 Environment: ${env_1.env.NODE_ENV}
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
