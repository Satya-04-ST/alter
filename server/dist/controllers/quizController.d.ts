import { Request, Response, NextFunction } from 'express';
export declare class QuizController {
    /**
     * Generate Grounded Evaluation Quiz
     */
    generateQuiz(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get Quizzes List
     */
    getQuizzes(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get Quiz by ID
     */
    getQuizById(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Submit Quiz Attempt & Grade
     */
    submitAttempt(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get Attempts for Quiz
     */
    getAttempts(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const quizController: QuizController;
