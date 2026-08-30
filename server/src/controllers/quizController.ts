import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { quizService } from '../services/quizService';
import { prisma, memStore } from '../config/prisma';

const generateQuizSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  questionCount: z.number().int().min(1).max(10).optional().default(4),
  subjectTag: z.string().optional(),
});

const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedAnswer: z.number().int(),
    })
  ),
});

export class QuizController {
  /**
   * Generate Grounded Evaluation Quiz
   */
  async generateQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { topic, questionCount, subjectTag } = generateQuizSchema.parse(req.body);

      const quiz = await quizService.generateQuiz(userId, topic, questionCount, subjectTag);

      res.status(201).json({
        success: true,
        quiz,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Quizzes List
   */
  async getQuizzes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      if (memStore.isPostgresReady) {
        const quizzes = await prisma.quiz.findMany({
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        res.status(200).json({ success: true, quizzes });
      } else {
        const quizzes = Array.from(memStore.quizzes.values()).filter((q) => q.userId === userId);
        res.status(200).json({ success: true, quizzes });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Quiz by ID
   */
  async getQuizById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;

      if (memStore.isPostgresReady) {
        const quiz = await prisma.quiz.findUnique({ where: { id } });
        if (!quiz) {
          res.status(404).json({ success: false, error: 'Quiz not found' });
          return;
        }
        res.status(200).json({ success: true, quiz });
      } else {
        const quiz = memStore.quizzes.get(id);
        if (!quiz) {
          res.status(404).json({ success: false, error: 'Quiz not found' });
          return;
        }
        res.status(200).json({ success: true, quiz });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit Quiz Attempt & Grade
   */
  async submitAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;
      const { answers } = submitAttemptSchema.parse(req.body);

      const attempt = await quizService.submitQuizAttempt(userId, quizId, answers);

      res.status(200).json({
        success: true,
        attempt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Attempts for Quiz
   */
  async getAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const quizId = req.params.id as string;

      if (memStore.isPostgresReady) {
        const attempts = await prisma.quizAttempt.findMany({
          where: { userId, quizId },
          orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, attempts });
      } else {
        const attempts = Array.from(memStore.quizAttempts.values()).filter(
          (a) => a.userId === userId && a.quizId === quizId
        );
        res.status(200).json({ success: true, attempts });
      }
    } catch (error) {
      next(error);
    }
  }
}

export const quizController = new QuizController();
