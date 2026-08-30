import { Request, Response, NextFunction } from 'express';
export declare class ResearchController {
    /**
     * Synthesize Multi-Source Study Guide Notebook
     */
    synthesizeStudyGuide(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Analyze Research Paper and Generate Interactive Concept Knowledge Graph
     */
    analyzePaperAndGraph(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const researchController: ResearchController;
