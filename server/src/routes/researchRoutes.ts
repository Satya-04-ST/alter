import { Router } from 'express';
import { researchController } from '../controllers/researchController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJwt);

router.post('/synthesize', (req, res, next) => researchController.synthesizeStudyGuide(req, res, next));
router.post('/paper-analysis', (req, res, next) => researchController.analyzePaperAndGraph(req, res, next));
router.get('/graph', (req, res, next) => researchController.analyzePaperAndGraph(req, res, next));

export default router;
