import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma, memStore } from '../config/prisma';

const logSessionSchema = z.object({
  durationMin: z.number().int().min(1).max(300),
  category: z.enum(['POMODORO', 'LECTURE_REVIEW', 'RESEARCH', 'QUIZ_PRACTICE']).default('POMODORO'),
  subject: z.string().optional(),
});

// In-Memory Study Session map
const fallbackStudySessions = new Map<string, { id: string; userId: string; durationMin: number; category: string; subject?: string; createdAt: Date }>();

export class StudySessionController {
  /**
   * Log completed study / Pomodoro session
   */
  async logSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { durationMin, category, subject } = logSessionSchema.parse(req.body);

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      if (memStore.isPostgresReady) {
        const session = await prisma.studySession.create({
          data: {
            id: sessionId,
            userId,
            durationMin,
            category,
            subject: subject || null,
          },
        });
        res.status(201).json({ success: true, session });
      } else {
        const session = {
          id: sessionId,
          userId,
          durationMin,
          category,
          subject,
          createdAt: new Date(),
        };
        fallbackStudySessions.set(sessionId, session);
        res.status(201).json({ success: true, session });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Study Streak and Analytics Stats
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      let sessions: { durationMin: number; category: string; createdAt: Date }[] = [];

      if (memStore.isPostgresReady) {
        sessions = await prisma.studySession.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        sessions = Array.from(fallbackStudySessions.values()).filter((s) => s.userId === userId);
      }

      const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMin, 0);
      const totalSessions = sessions.length;
      const streakDays = totalSessions > 0 ? Math.min(totalSessions, 7) : 0;

      res.status(200).json({
        success: true,
        stats: {
          totalMinutes,
          totalHours: (totalMinutes / 60).toFixed(1),
          totalSessions,
          streakDays,
          recentSessions: sessions.slice(0, 10),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const studySessionController = new StudySessionController();
