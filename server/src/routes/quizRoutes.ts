import { Router } from 'express';
import { quizController } from '../controllers/quizController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJwt);

router.post('/generate', (req, res, next) => quizController.generateQuiz(req, res, next));
router.get('/', (req, res, next) => quizController.getQuizzes(req, res, next));
router.get('/:id', (req, res, next) => quizController.getQuizById(req, res, next));
router.post('/:id/attempt', (req, res, next) => quizController.submitAttempt(req, res, next));
router.get('/:id/attempts', (req, res, next) => quizController.getAttempts(req, res, next));

export default router;
