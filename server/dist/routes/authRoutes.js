"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
// Public Auth Endpoints
router.post('/register', rateLimiter_1.authLimiter, (req, res, next) => authController_1.authController.register(req, res, next));
router.post('/login', rateLimiter_1.authLimiter, (req, res, next) => authController_1.authController.login(req, res, next));
// Protected Profile Endpoints
router.get('/profile', authMiddleware_1.authenticateJwt, (req, res, next) => authController_1.authController.getProfile(req, res, next));
router.put('/profile', authMiddleware_1.authenticateJwt, (req, res, next) => authController_1.authController.updateProfile(req, res, next));
exports.default = router;
