"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma_1 = require("../config/prisma");
const authenticateJwt = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Authentication token is missing or malformed',
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (prisma_1.memStore.isPostgresReady) {
            const dbUser = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, email: true, name: true, role: true },
            });
            if (!dbUser) {
                res.status(401).json({ success: false, error: 'User session not found' });
                return;
            }
            req.user = {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role,
            };
        }
        else {
            const memUser = prisma_1.memStore.users.get(decoded.id);
            if (!memUser && !decoded.email) {
                res.status(401).json({ success: false, error: 'User session not found' });
                return;
            }
            req.user = {
                id: decoded.id,
                email: memUser ? memUser.email : decoded.email,
                name: memUser ? memUser.name : decoded.name || 'User',
                role: memUser ? memUser.role : (decoded.role || 'STUDENT'),
            };
        }
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
            return;
        }
        res.status(401).json({ success: false, error: 'Invalid authentication token.' });
    }
};
exports.authenticateJwt = authenticateJwt;
