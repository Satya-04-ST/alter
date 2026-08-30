"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = exports.ChatController = void 0;
const zod_1 = require("zod");
const personaRouter_1 = require("../personas/personaRouter");
const ragService_1 = require("../services/ragService");
const prisma_1 = require("../config/prisma");
const streamQuerySchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Query message cannot be empty'),
    persona: zod_1.z.enum(['ADVISOR', 'LIBRARIAN', 'TUTOR', 'EDITOR', 'ROOMMATE']).default('TUTOR'),
    subjectTag: zod_1.z.string().optional(),
});
const ragQuerySchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Query is required'),
    topK: zod_1.z.number().int().min(1).max(20).optional().default(5),
    subjectTag: zod_1.z.string().optional(),
});
// In-Memory Thread Storage for Fallback Store
const fallbackThreads = new Map();
class ChatController {
    /**
     * SSE Stream Chat Endpoint with LangGraph & Multi-Persona routing
     */
    async streamChat(req, res, next) {
        try {
            const userId = req.user.id;
            const { query, persona, subjectTag } = streamQuerySchema.parse(req.body);
            // Setup Server-Sent Events headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders?.();
            let accumulatedResponse = '';
            let capturedCitations = [];
            try {
                const stream = personaRouter_1.personaRouter.streamResponse(userId, query, persona, subjectTag);
                for await (const chunk of stream) {
                    if (chunk.type === 'token' && chunk.token) {
                        accumulatedResponse += chunk.token;
                    }
                    if (chunk.type === 'citation' && chunk.citations) {
                        capturedCitations = chunk.citations;
                    }
                    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
                }
                // Save conversation history to ChatThread
                await this.persistThreadMessage(userId, persona, query, accumulatedResponse, capturedCitations);
            }
            catch (streamError) {
                console.error('Stream generation error:', streamError);
                res.write(`data: ${JSON.stringify({ type: 'error', error: streamError.message })}\n\n`);
            }
            finally {
                res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
                res.end();
            }
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Synchronous Grounded Semantic RAG Search
     */
    async ragQuery(req, res, next) {
        try {
            const userId = req.user.id;
            const { query, topK, subjectTag } = ragQuerySchema.parse(req.body);
            const chunks = await ragService_1.ragService.searchSimilarChunks(userId, query, topK, subjectTag);
            res.status(200).json({
                success: true,
                query,
                count: chunks.length,
                chunks,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get Chat History for specific persona
     */
    async getThread(req, res, next) {
        try {
            const userId = req.user.id;
            const personaParam = req.params.persona.toUpperCase();
            if (prisma_1.memStore.isPostgresReady) {
                const thread = await prisma_1.prisma.chatThread.findFirst({
                    where: { userId, persona: personaParam },
                });
                res.status(200).json({
                    success: true,
                    persona: personaParam,
                    messages: thread ? thread.messages : [],
                });
            }
            else {
                const key = `${userId}_${personaParam}`;
                const messages = fallbackThreads.get(key) || [];
                res.status(200).json({
                    success: true,
                    persona: personaParam,
                    messages,
                });
            }
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Clear Chat History for specific persona
     */
    async clearThread(req, res, next) {
        try {
            const userId = req.user.id;
            const personaParam = req.params.persona.toUpperCase();
            if (prisma_1.memStore.isPostgresReady) {
                await prisma_1.prisma.chatThread.deleteMany({
                    where: { userId, persona: personaParam },
                });
            }
            else {
                const key = `${userId}_${personaParam}`;
                fallbackThreads.delete(key);
            }
            res.status(200).json({
                success: true,
                message: `Chat history for ${personaParam} cleared`,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Helper to persist user message and persona response
     */
    async persistThreadMessage(userId, persona, userText, assistantText, citations) {
        const userMsg = {
            sender: 'USER',
            text: userText,
            timestamp: new Date().toISOString(),
        };
        const assistantMsg = {
            sender: persona,
            text: assistantText,
            citations,
            timestamp: new Date().toISOString(),
        };
        if (prisma_1.memStore.isPostgresReady) {
            try {
                const existing = await prisma_1.prisma.chatThread.findFirst({
                    where: { userId, persona },
                });
                if (existing) {
                    const prevMessages = existing.messages || [];
                    await prisma_1.prisma.chatThread.update({
                        where: { id: existing.id },
                        data: {
                            messages: [...prevMessages, userMsg, assistantMsg],
                        },
                    });
                }
                else {
                    await prisma_1.prisma.chatThread.create({
                        data: {
                            userId,
                            persona,
                            messages: [userMsg, assistantMsg],
                        },
                    });
                }
            }
            catch (err) {
                console.warn('Prisma chatThread persist error:', err.message);
            }
        }
        else {
            const key = `${userId}_${persona}`;
            const existing = fallbackThreads.get(key) || [];
            existing.push(userMsg, assistantMsg);
            fallbackThreads.set(key, existing);
        }
    }
}
exports.ChatController = ChatController;
exports.chatController = new ChatController();
