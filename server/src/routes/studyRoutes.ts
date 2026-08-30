import { Router } from 'express';
import { studySessionController } from '../controllers/studySessionController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJwt);

router.post('/sessions', (req, res, next) => studySessionController.logSession(req, res, next));
router.get('/stats', (req, res, next) => studySessionController.getStats(req, res, next));

export default router;
