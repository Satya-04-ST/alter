import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma, memStore, FallbackDocument } from '../config/prisma';
import { dispatchDocumentIngestion } from '../queues/documentQueue';

export class DocumentController {
  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({ success: false, error: 'No file uploaded. Please provide a PDF or image file.' });
        return;
      }

      // Infer or accept fileType
      let fileType = (req.body.fileType || '').toUpperCase();
      if (!['SYLLABUS', 'HANDBOOK', 'RESUME', 'PAPER'].includes(fileType)) {
        const lowerName = file.originalname.toLowerCase();
        if (lowerName.includes('syllabus') || lowerName.includes('curriculum')) {
          fileType = 'SYLLABUS';
        } else if (lowerName.includes('handbook') || lowerName.includes('guide')) {
          fileType = 'HANDBOOK';
        } else if (lowerName.includes('resume') || lowerName.includes('cv')) {
          fileType = 'RESUME';
        } else if (lowerName.includes('paper') || lowerName.includes('research')) {
          fileType = 'PAPER';
        } else {
          fileType = 'SYLLABUS';
        }
      }

      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
      const fileUrl = `/uploads/${file.filename}`;

      if (memStore.isPostgresReady) {
        const doc = await prisma.document.create({
          data: {
            id: documentId,
            userId,
            fileName: file.originalname,
            fileUrl,
            fileType,
            status: 'PROCESSING',
            fileSize: file.size,
          },
        });

        // Trigger asynchronous background ingestion
        await dispatchDocumentIngestion({
          documentId: doc.id,
          userId,
          filePath: file.path,
          fileName: file.originalname,
          mimeType: file.mimetype,
        });

        res.status(202).json({
          success: true,
          message: 'Document uploaded and queued for background ingestion',
          document: doc,
        });
      } else {
        const fallbackDoc: FallbackDocument = {
          id: documentId,
          userId,
          fileName: file.originalname,
          fileUrl,
          fileType,
          status: 'PROCESSING',
          fileSize: file.size,
          createdAt: new Date(),
        };

        memStore.documents.set(documentId, fallbackDoc);

        // Trigger ingestion
        await dispatchDocumentIngestion({
          documentId,
          userId,
          filePath: file.path,
          fileName: file.originalname,
          mimeType: file.mimetype,
        });

        res.status(202).json({
          success: true,
          message: 'Document uploaded and processing pipeline initiated',
          document: fallbackDoc,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      if (memStore.isPostgresReady) {
        const docs = await prisma.document.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { chunks: true },
            },
          },
        });

        const formatted = docs.map((d) => ({
          ...d,
          chunkCount: d._count.chunks,
        }));

        res.status(200).json({ success: true, documents: formatted });
      } else {
        const userDocs = Array.from(memStore.documents.values())
          .filter((d) => d.userId === userId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const formatted = userDocs.map((d) => {
          const chunkCount = Array.from(memStore.chunks.values()).filter(
            (c) => c.documentId === d.id
          ).length;
          return {
            ...d,
            chunkCount,
          };
        });

        res.status(200).json({ success: true, documents: formatted });
      }
    } catch (error) {
      next(error);
    }
  }

  async getDocumentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      if (memStore.isPostgresReady) {
        const doc = await prisma.document.findFirst({
          where: { id, userId },
          include: {
            chunks: {
              select: {
                id: true,
                content: true,
                subjectTag: true,
                moduleIndex: true,
                createdAt: true,
              },
            },
          },
        });

        if (!doc) {
          res.status(404).json({ success: false, error: 'Document not found' });
          return;
        }

        res.status(200).json({ success: true, document: doc });
      } else {
        const doc = memStore.documents.get(id);
        if (!doc || doc.userId !== userId) {
          res.status(404).json({ success: false, error: 'Document not found' });
          return;
        }

        const chunks = Array.from(memStore.chunks.values())
          .filter((c) => c.documentId === id)
          .map((c) => ({
            id: c.id,
            content: c.content,
            subjectTag: c.subjectTag,
            moduleIndex: c.moduleIndex,
            hasEmbedding: Boolean(c.embedding && c.embedding.length > 0),
            createdAt: c.createdAt,
          }));

        res.status(200).json({
          success: true,
          document: {
            ...doc,
            chunks,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      if (memStore.isPostgresReady) {
        const doc = await prisma.document.findFirst({ where: { id, userId } });
        if (!doc) {
          res.status(404).json({ success: false, error: 'Document not found' });
          return;
        }

        // Delete from database
        await prisma.document.delete({ where: { id } });

        res.status(200).json({ success: true, message: 'Document and vector chunks deleted successfully' });
      } else {
        const doc = memStore.documents.get(id);
        if (!doc || doc.userId !== userId) {
          res.status(404).json({ success: false, error: 'Document not found' });
          return;
        }

        // Delete from memStore
        memStore.documents.delete(id);
        for (const [chunkId, chunk] of memStore.chunks) {
          if (chunk.documentId === id) {
            memStore.chunks.delete(chunkId);
          }
        }

        res.status(200).json({ success: true, message: 'Document and vector chunks deleted successfully' });
      }
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
