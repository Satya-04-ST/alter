"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const env_1 = require("../config/env");
const prisma_1 = require("../config/prisma");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    targetRole: zod_1.z.string().optional().default('AI Systems Architect'),
    degreeName: zod_1.z.string().optional().default('B.Tech in Computer Science'),
    currentSemester: zod_1.z.number().int().min(1).max(12).optional().default(4),
    gpa: zod_1.z.number().min(0).max(10).optional().default(3.8),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    targetRole: zod_1.z.string().optional(),
    degreeName: zod_1.z.string().optional(),
    currentSemester: zod_1.z.number().int().min(1).max(12).optional(),
    gpa: zod_1.z.number().min(0).max(10).optional(),
});
class AuthController {
    async register(req, res, next) {
        try {
            const data = registerSchema.parse(req.body);
            // Check if user already exists
            if (prisma_1.memStore.isPostgresReady) {
                const existing = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
                if (existing) {
                    res.status(409).json({ success: false, error: 'User with this email already exists' });
                    return;
                }
                const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
                const user = await prisma_1.prisma.user.create({
                    data: {
                        email: data.email,
                        passwordHash,
                        name: data.name,
                        targetRole: data.targetRole,
                        degreeName: data.degreeName,
                        currentSemester: data.currentSemester,
                        gpa: data.gpa,
                        role: 'STUDENT',
                    },
                });
                const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
                res.status(201).json({
                    success: true,
                    message: 'Account registered successfully',
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        targetRole: user.targetRole,
                        degreeName: user.degreeName,
                        currentSemester: user.currentSemester,
                        gpa: user.gpa,
                        role: user.role,
                    },
                });
            }
            else {
                // Fallback Store
                for (const [_, u] of prisma_1.memStore.users) {
                    if (u.email.toLowerCase() === data.email.toLowerCase()) {
                        res.status(409).json({ success: false, error: 'User with this email already exists' });
                        return;
                    }
                }
                const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
                const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
                const fallbackUser = {
                    id: userId,
                    email: data.email,
                    passwordHash,
                    name: data.name,
                    targetRole: data.targetRole,
                    degreeName: data.degreeName,
                    currentSemester: data.currentSemester,
                    gpa: data.gpa,
                    role: 'STUDENT',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                prisma_1.memStore.users.set(userId, fallbackUser);
                const token = jsonwebtoken_1.default.sign({ id: userId, email: data.email, name: data.name, role: 'STUDENT' }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
                res.status(201).json({
                    success: true,
                    message: 'Account registered successfully',
                    token,
                    user: {
                        id: userId,
                        email: data.email,
                        name: data.name,
                        targetRole: data.targetRole,
                        degreeName: data.degreeName,
                        currentSemester: data.currentSemester,
                        gpa: data.gpa,
                        role: 'STUDENT',
                    },
                });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const data = loginSchema.parse(req.body);
            let userRecord = null;
            if (prisma_1.memStore.isPostgresReady) {
                userRecord = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
            }
            else {
                for (const [_, u] of prisma_1.memStore.users) {
                    if (u.email.toLowerCase() === data.email.toLowerCase()) {
                        userRecord = u;
                        break;
                    }
                }
            }
            if (!userRecord) {
                res.status(401).json({ success: false, error: 'Invalid email or password' });
                return;
            }
            const isMatch = await bcryptjs_1.default.compare(data.password, userRecord.passwordHash);
            if (!isMatch) {
                res.status(401).json({ success: false, error: 'Invalid email or password' });
                return;
            }
            const token = jsonwebtoken_1.default.sign({
                id: userRecord.id,
                email: userRecord.email,
                name: userRecord.name,
                role: userRecord.role,
            }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
            res.status(200).json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: userRecord.id,
                    email: userRecord.email,
                    name: userRecord.name,
                    targetRole: userRecord.targetRole,
                    degreeName: userRecord.degreeName,
                    currentSemester: userRecord.currentSemester,
                    gpa: userRecord.gpa,
                    role: userRecord.role,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            if (prisma_1.memStore.isPostgresReady) {
                const user = await prisma_1.prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        targetRole: true,
                        degreeName: true,
                        currentSemester: true,
                        gpa: true,
                        role: true,
                        createdAt: true,
                        _count: {
                            select: {
                                documents: true,
                                courses: true,
                                tasks: true,
                            },
                        },
                    },
                });
                if (!user) {
                    res.status(404).json({ success: false, error: 'User profile not found' });
                    return;
                }
                res.status(200).json({ success: true, user });
            }
            else {
                const user = prisma_1.memStore.users.get(userId);
                if (!user) {
                    // If not in memStore, return req.user payload
                    res.status(200).json({
                        success: true,
                        user: {
                            ...req.user,
                            targetRole: 'AI Systems Architect',
                            degreeName: 'B.Tech in Computer Science',
                            currentSemester: 4,
                            gpa: 3.8,
                            _count: { documents: prisma_1.memStore.documents.size, courses: 0, tasks: 0 },
                        },
                    });
                    return;
                }
                const docCount = Array.from(prisma_1.memStore.documents.values()).filter((d) => d.userId === userId).length;
                res.status(200).json({
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        targetRole: user.targetRole,
                        degreeName: user.degreeName,
                        currentSemester: user.currentSemester,
                        gpa: user.gpa,
                        role: user.role,
                        createdAt: user.createdAt,
                        _count: {
                            documents: docCount,
                            courses: 0,
                            tasks: 0,
                        },
                    },
                });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const data = updateProfileSchema.parse(req.body);
            if (prisma_1.memStore.isPostgresReady) {
                const updated = await prisma_1.prisma.user.update({
                    where: { id: userId },
                    data,
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        targetRole: true,
                        degreeName: true,
                        currentSemester: true,
                        gpa: true,
                        role: true,
                    },
                });
                res.status(200).json({ success: true, user: updated });
            }
            else {
                const user = prisma_1.memStore.users.get(userId);
                if (!user) {
                    res.status(404).json({ success: false, error: 'User not found' });
                    return;
                }
                if (data.name)
                    user.name = data.name;
                if (data.targetRole)
                    user.targetRole = data.targetRole;
                if (data.degreeName)
                    user.degreeName = data.degreeName;
                if (data.currentSemester)
                    user.currentSemester = data.currentSemester;
                if (data.gpa !== undefined)
                    user.gpa = data.gpa;
                user.updatedAt = new Date();
                prisma_1.memStore.users.set(userId, user);
                res.status(200).json({ success: true, user });
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
