import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authenticateJwt } from '../middlewares/authMiddleware';
import { aiStreamLimiter } from '../middlewares/rateLimiter';

const router = Router();

// All chat endpoints require JWT authentication
router.use(authenticateJwt);

// SSE Streaming AI Endpoint
router.post('/stream', aiStreamLimiter, (req, res, next) =>
  chatController.streamChat(req, res, next)
);

// Grounded Semantic Search Endpoint
router.post('/rag-query', (req, res, next) =>
  chatController.ragQuery(req, res, next)
);

// Chat Threads
router.get('/threads/:persona', (req, res, next) =>
  chatController.getThread(req, res, next)
);
router.delete('/threads/:persona', (req, res, next) =>
  chatController.clearThread(req, res, next)
);

export default router;
