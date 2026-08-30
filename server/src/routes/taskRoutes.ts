import { Router } from 'express';
import { plannerController } from '../controllers/plannerController';
import { authenticateJwt } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateJwt);

// Tasks & Cut-List Triage
router.get('/', (req, res, next) => plannerController.getTasks(req, res, next));
router.post('/', (req, res, next) => plannerController.createTask(req, res, next));
router.patch('/cut-list', (req, res, next) => plannerController.runCutListTriage(req, res, next));
router.patch('/:id', (req, res, next) => plannerController.updateTask(req, res, next));
router.delete('/:id', (req, res, next) => plannerController.deleteTask(req, res, next));

export default router;
