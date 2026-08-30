"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizController = exports.QuizController = void 0;
const zod_1 = require("zod");
const quizService_1 = require("../services/quizService");
const prisma_1 = require("../config/prisma");
const generateQuizSchema = zod_1.z.object({
    topic: zod_1.z.string().min(1, 'Topic is required'),
    questionCount: zod_1.z.number().int().min(1).max(10).optional().default(4),
    subjectTag: zod_1.z.string().optional(),
});
const submitAttemptSchema = zod_1.z.object({
    answers: zod_1.z.array(zod_1.z.object({
        questionId: zod_1.z.string(),
        selectedAnswer: zod_1.z.number().int(),
    })),
});
class QuizController {
    /**
     * Generate Grounded Evaluation Quiz
     */
    async generateQuiz(req, res, next) {
        try {
            const userId = req.user.id;
            const { topic, questionCount, subjectTag } = generateQuizSchema.parse(req.body);
            const quiz = await quizService_1.quizService.generateQuiz(userId, topic, questionCount, subjectTag);
            res.status(201).json({
                success: true,
                quiz,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get Quizzes List
     */
    async getQuizzes(req, res, next) {
        try {
            const userId = req.user.id;
            if (prisma_1.memStore.isPostgresReady) {
                const quizzes = await prisma_1.prisma.quiz.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                });
                res.status(200).json({ success: true, quizzes });
            }
            else {
                const quizzes = Array.from(prisma_1.memStore.quizzes.values()).filter((q) => q.userId === userId);
                res.status(200).json({ success: true, quizzes });
            }
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get Quiz by ID
     */
    async getQuizById(req, res, next) {
        try {
            const id = req.params.id;
            if (prisma_1.memStore.isPostgresReady) {
                const quiz = await prisma_1.prisma.quiz.findUnique({ where: { id } });
                if (!quiz) {
                    res.status(404).json({ success: false, error: 'Quiz not found' });
                    return;
                }
                res.status(200).json({ success: true, quiz });
            }
            else {
                const quiz = prisma_1.memStore.quizzes.get(id);
                if (!quiz) {
                    res.status(404).json({ success: false, error: 'Quiz not found' });
                    return;
                }
                res.status(200).json({ success: true, quiz });
            }
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Submit Quiz Attempt & Grade
     */
    async submitAttempt(req, res, next) {
        try {
            const userId = req.user.id;
            const quizId = req.params.id;
            const { answers } = submitAttemptSchema.parse(req.body);
            const attempt = await quizService_1.quizService.submitQuizAttempt(userId, quizId, answers);
            res.status(200).json({
                success: true,
                attempt,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get Attempts for Quiz
     */
    async getAttempts(req, res, next) {
        try {
            const userId = req.user.id;
            const quizId = req.params.id;
            if (prisma_1.memStore.isPostgresReady) {
                const attempts = await prisma_1.prisma.quizAttempt.findMany({
                    where: { userId, quizId },
                    orderBy: { createdAt: 'desc' },
                });
                res.status(200).json({ success: true, attempts });
            }
            else {
                const attempts = Array.from(prisma_1.memStore.quizAttempts.values()).filter((a) => a.userId === userId && a.quizId === quizId);
                res.status(200).json({ success: true, attempts });
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.QuizController = QuizController;
exports.quizController = new QuizController();
