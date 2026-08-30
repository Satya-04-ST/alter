import { Request, Response, NextFunction } from 'express';
export declare class StudySessionController {
    /**
     * Log completed study / Pomodoro session
     */
    logSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get Study Streak and Analytics Stats
     */
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const studySessionController: StudySessionController;
