import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { personaRouter, PersonaType } from '../personas/personaRouter';
import { ragService } from '../services/ragService';
import { prisma, memStore } from '../config/prisma';

const streamQuerySchema = z.object({
  query: z.string().min(1, 'Query message cannot be empty'),
  persona: z.enum(['ADVISOR', 'LIBRARIAN', 'TUTOR', 'EDITOR', 'ROOMMATE']).default('TUTOR'),
  subjectTag: z.string().optional(),
});

const ragQuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  topK: z.number().int().min(1).max(20).optional().default(5),
  subjectTag: z.string().optional(),
});

// In-Memory Thread Storage for Fallback Store
const fallbackThreads = new Map<string, { sender: string; text: string; citations?: any[]; timestamp: string }[]>();

export class ChatController {
  /**
   * SSE Stream Chat Endpoint with LangGraph & Multi-Persona routing
   */
  async streamChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { query, persona, subjectTag } = streamQuerySchema.parse(req.body);

      // Setup Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let accumulatedResponse = '';
      let capturedCitations: any[] = [];

      try {
        const stream = personaRouter.streamResponse(userId, query, persona, subjectTag);

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
      } catch (streamError: any) {
        console.error('Stream generation error:', streamError);
        res.write(`data: ${JSON.stringify({ type: 'error', error: streamError.message })}\n\n`);
      } finally {
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Synchronous Grounded Semantic RAG Search
   */
  async ragQuery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { query, topK, subjectTag } = ragQuerySchema.parse(req.body);

      const chunks = await ragService.searchSimilarChunks(userId, query, topK, subjectTag);

      res.status(200).json({
        success: true,
        query,
        count: chunks.length,
        chunks,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Chat History for specific persona
   */
  async getThread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const personaParam = (req.params.persona as string).toUpperCase() as PersonaType;

      if (memStore.isPostgresReady) {
        const thread = await prisma.chatThread.findFirst({
          where: { userId, persona: personaParam },
        });

        res.status(200).json({
          success: true,
          persona: personaParam,
          messages: thread ? (thread.messages as any[]) : [],
        });
      } else {
        const key = `${userId}_${personaParam}`;
        const messages = fallbackThreads.get(key) || [];
        res.status(200).json({
          success: true,
          persona: personaParam,
          messages,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear Chat History for specific persona
   */
  async clearThread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const personaParam = (req.params.persona as string).toUpperCase() as PersonaType;

      if (memStore.isPostgresReady) {
        await prisma.chatThread.deleteMany({
          where: { userId, persona: personaParam },
        });
      } else {
        const key = `${userId}_${personaParam}`;
        fallbackThreads.delete(key);
      }

      res.status(200).json({
        success: true,
        message: `Chat history for ${personaParam} cleared`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper to persist user message and persona response
   */
  private async persistThreadMessage(
    userId: string,
    persona: PersonaType,
    userText: string,
    assistantText: string,
    citations: any[]
  ) {
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

    if (memStore.isPostgresReady) {
      try {
        const existing = await prisma.chatThread.findFirst({
          where: { userId, persona },
        });

        if (existing) {
          const prevMessages = (existing.messages as any[]) || [];
          await prisma.chatThread.update({
            where: { id: existing.id },
            data: {
              messages: [...prevMessages, userMsg, assistantMsg],
            },
          });
        } else {
          await prisma.chatThread.create({
            data: {
              userId,
              persona,
              messages: [userMsg, assistantMsg],
            },
          });
        }
      } catch (err: any) {
        console.warn('Prisma chatThread persist error:', err.message);
      }
    } else {
      const key = `${userId}_${persona}`;
      const existing = fallbackThreads.get(key) || [];
      existing.push(userMsg, assistantMsg);
      fallbackThreads.set(key, existing);
    }
  }
}

export const chatController = new ChatController();
