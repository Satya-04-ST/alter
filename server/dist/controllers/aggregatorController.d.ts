import { Request, Response, NextFunction } from 'express';
export declare class AggregatorController {
    /**
     * Get Active Student Hackathons & Bounties
     */
    getHackathons(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Search ArXiv Research Papers
     */
    searchArxiv(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const aggregatorController: AggregatorController;
