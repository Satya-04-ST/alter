import { Request, Response, NextFunction } from 'express';
export declare class ChatController {
    /**
     * SSE Stream Chat Endpoint with LangGraph & Multi-Persona routing
     */
    streamChat(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Synchronous Grounded Semantic RAG Search
     */
    ragQuery(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get Chat History for specific persona
     */
    getThread(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Clear Chat History for specific persona
     */
    clearThread(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Helper to persist user message and persona response
     */
    private persistThreadMessage;
}
export declare const chatController: ChatController;
