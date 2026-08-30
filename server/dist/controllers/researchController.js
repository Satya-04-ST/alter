"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.researchController = exports.ResearchController = void 0;
const zod_1 = require("zod");
const synthesisService_1 = require("../services/synthesisService");
const synthesizeSchema = zod_1.z.object({
    topic: zod_1.z.string().min(1, 'Topic is required'),
    subjectTag: zod_1.z.string().optional(),
});
class ResearchController {
    /**
     * Synthesize Multi-Source Study Guide Notebook
     */
    async synthesizeStudyGuide(req, res, next) {
        try {
            const userId = req.user.id;
            const { topic, subjectTag } = synthesizeSchema.parse(req.body);
            const guide = await synthesisService_1.synthesisService.synthesizeStudyGuide(userId, topic, subjectTag);
            res.status(200).json({
                success: true,
                guide,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Analyze Research Paper and Generate Interactive Concept Knowledge Graph
     */
    async analyzePaperAndGraph(req, res, next) {
        try {
            const topic = req.query.topic || req.body.topic || 'Distributed Consensus & Swarm Robotics';
            const result = await synthesisService_1.synthesisService.analyzePaperAndGraph(topic);
            res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ResearchController = ResearchController;
exports.researchController = new ResearchController();
