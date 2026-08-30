import { Request, Response, NextFunction } from 'express';
export declare class PlannerController {
    /**
     * Get all schedule events (Class timetable + Auto-scheduled focus slots)
     */
    getEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create custom calendar event
     */
    createEvent(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete calendar event
     */
    deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Ingest and Parse Class Timetable
     */
    uploadTimetable(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Trigger Conflict-Free Auto-Scheduling Algorithm
     */
    autoSchedule(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get Tasks with filtering
     */
    getTasks(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create Academic Task
     */
    createTask(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update Task Status or Priority
     */
    updateTask(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete Task
     */
    deleteTask(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Run Academic Cut-List Triage Engine
     */
    runCutListTriage(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const plannerController: PlannerController;
