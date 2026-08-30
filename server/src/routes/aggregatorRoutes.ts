import { Router } from 'express';
import { aggregatorController } from '../controllers/aggregatorController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJwt);

router.get('/hackathons', (req, res, next) => aggregatorController.getHackathons(req, res, next));
router.get('/arxiv', (req, res, next) => aggregatorController.searchArxiv(req, res, next));

export default router;
