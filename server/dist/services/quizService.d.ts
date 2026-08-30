import { FallbackQuiz, FallbackQuizAttempt } from '../config/prisma';
export declare class QuizService {
    private geminiAI;
    private openai;
    constructor();
    /**
     * Generate an active-recall evaluation quiz grounded in syllabus documents
     */
    generateQuiz(userId: string, topic: string, questionCount?: number, subjectTag?: string): Promise<FallbackQuiz>;
    /**
     * Submit and evaluate quiz attempt
     */
    submitQuizAttempt(userId: string, quizId: string, answers: {
        questionId: string;
        selectedAnswer: number;
    }[]): Promise<FallbackQuizAttempt>;
}
export declare const quizService: QuizService;
