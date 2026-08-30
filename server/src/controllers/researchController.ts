import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { synthesisService } from '../services/synthesisService';

const synthesizeSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  subjectTag: z.string().optional(),
});

export class ResearchController {
  /**
   * Synthesize Multi-Source Study Guide Notebook
   */
  async synthesizeStudyGuide(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { topic, subjectTag } = synthesizeSchema.parse(req.body);

      const guide = await synthesisService.synthesizeStudyGuide(userId, topic, subjectTag);

      res.status(200).json({
        success: true,
        guide,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Analyze Research Paper and Generate Interactive Concept Knowledge Graph
   */
  async analyzePaperAndGraph(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topic = (req.query.topic as string) || (req.body.topic as string) || 'Distributed Consensus & Swarm Robotics';
      const result = await synthesisService.analyzePaperAndGraph(topic);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const researchController = new ResearchController();
