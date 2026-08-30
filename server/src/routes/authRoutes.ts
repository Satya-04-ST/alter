import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateJwt } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Public Auth Endpoints
router.post('/register', authLimiter, (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, (req, res, next) => authController.login(req, res, next));

// Protected Profile Endpoints
router.get('/profile', authenticateJwt, (req, res, next) => authController.getProfile(req, res, next));
router.put('/profile', authenticateJwt, (req, res, next) => authController.updateProfile(req, res, next));

export default router;
