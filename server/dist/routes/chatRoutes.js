"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// All chat endpoints require JWT authentication
router.use(authMiddleware_1.authenticateJwt);
// SSE Streaming AI Endpoint
router.post('/stream', rateLimiter_1.aiStreamLimiter, (req, res, next) => chatController_1.chatController.streamChat(req, res, next));
// Grounded Semantic Search Endpoint
router.post('/rag-query', (req, res, next) => chatController_1.chatController.ragQuery(req, res, next));
// Chat Threads
router.get('/threads/:persona', (req, res, next) => chatController_1.chatController.getThread(req, res, next));
router.delete('/threads/:persona', (req, res, next) => chatController_1.chatController.clearThread(req, res, next));
exports.default = router;
