import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { prisma, memStore, FallbackUser } from '../config/prisma';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  targetRole: z.string().optional().default('AI Systems Architect'),
  degreeName: z.string().optional().default('B.Tech in Computer Science'),
  currentSemester: z.number().int().min(1).max(12).optional().default(4),
  gpa: z.number().min(0).max(10).optional().default(3.8),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  targetRole: z.string().optional(),
  degreeName: z.string().optional(),
  currentSemester: z.number().int().min(1).max(12).optional(),
  gpa: z.number().min(0).max(10).optional(),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);

      // Check if user already exists
      if (memStore.isPostgresReady) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
          res.status(409).json({ success: false, error: 'User with this email already exists' });
          return;
        }

        const passwordHash = await bcrypt.hash(data.password, 12);
        const user = await prisma.user.create({
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

        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name, role: user.role },
          env.JWT_SECRET,
          { expiresIn: env.JWT_EXPIRES_IN as any }
        );

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
      } else {
        // Fallback Store
        for (const [_, u] of memStore.users) {
          if (u.email.toLowerCase() === data.email.toLowerCase()) {
            res.status(409).json({ success: false, error: 'User with this email already exists' });
            return;
          }
        }

        const passwordHash = await bcrypt.hash(data.password, 12);
        const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
        const fallbackUser: FallbackUser = {
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
        memStore.users.set(userId, fallbackUser);

        const token = jwt.sign(
          { id: userId, email: data.email, name: data.name, role: 'STUDENT' },
          env.JWT_SECRET,
          { expiresIn: env.JWT_EXPIRES_IN as any }
        );

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
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);

      let userRecord: {
        id: string;
        email: string;
        passwordHash: string;
        name: string;
        targetRole?: string | null;
        degreeName?: string | null;
        currentSemester: number;
        gpa?: number | null;
        role: string;
      } | null = null;

      if (memStore.isPostgresReady) {
        userRecord = await prisma.user.findUnique({ where: { email: data.email } });
      } else {
        for (const [_, u] of memStore.users) {
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

      const isMatch = await bcrypt.compare(data.password, userRecord.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      const token = jwt.sign(
        {
          id: userRecord.id,
          email: userRecord.email,
          name: userRecord.name,
          role: userRecord.role,
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

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
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      if (memStore.isPostgresReady) {
        const user = await prisma.user.findUnique({
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
      } else {
        const user = memStore.users.get(userId);
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
              _count: { documents: memStore.documents.size, courses: 0, tasks: 0 },
            },
          });
          return;
        }

        const docCount = Array.from(memStore.documents.values()).filter((d) => d.userId === userId).length;

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
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = updateProfileSchema.parse(req.body);

      if (memStore.isPostgresReady) {
        const updated = await prisma.user.update({
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
      } else {
        const user = memStore.users.get(userId);
        if (!user) {
          res.status(404).json({ success: false, error: 'User not found' });
          return;
        }

        if (data.name) user.name = data.name;
        if (data.targetRole) user.targetRole = data.targetRole;
        if (data.degreeName) user.degreeName = data.degreeName;
        if (data.currentSemester) user.currentSemester = data.currentSemester;
        if (data.gpa !== undefined) user.gpa = data.gpa;
        user.updatedAt = new Date();

        memStore.users.set(userId, user);

        res.status(200).json({ success: true, user });
      }
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
