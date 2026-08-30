import { Request, Response, NextFunction } from 'express';
import { aggregatorService } from '../services/aggregatorService';

export class AggregatorController {
  /**
   * Get Active Student Hackathons & Bounties
   */
  async getHackathons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hackathons = await aggregatorService.getCuratedHackathons();
      res.status(200).json({
        success: true,
        count: hackathons.length,
        hackathons,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search ArXiv Research Papers
   */
  async searchArxiv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || 'Distributed Systems';
      const papers = await aggregatorService.searchArxivPapers(query);

      res.status(200).json({
        success: true,
        query,
        count: papers.length,
        papers,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aggregatorController = new AggregatorController();
