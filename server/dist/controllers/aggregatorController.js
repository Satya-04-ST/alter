"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregatorController = exports.AggregatorController = void 0;
const aggregatorService_1 = require("../services/aggregatorService");
class AggregatorController {
    /**
     * Get Active Student Hackathons & Bounties
     */
    async getHackathons(req, res, next) {
        try {
            const hackathons = await aggregatorService_1.aggregatorService.getCuratedHackathons();
            res.status(200).json({
                success: true,
                count: hackathons.length,
                hackathons,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Search ArXiv Research Papers
     */
    async searchArxiv(req, res, next) {
        try {
            const query = req.query.q || 'Distributed Systems';
            const papers = await aggregatorService_1.aggregatorService.searchArxivPapers(query);
            res.status(200).json({
                success: true,
                query,
                count: papers.length,
                papers,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AggregatorController = AggregatorController;
exports.aggregatorController = new AggregatorController();
