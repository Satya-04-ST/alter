import { Queue, Worker, Job } from 'bullmq';
import { redisClient, isRedisConnected } from '../config/redis';
import { prisma, memStore } from '../config/prisma';
import { ingestionService } from '../services/ingestionService';
import { ragService } from '../services/ragService';

export interface IngestionJobData {
  documentId: string;
  userId: string;
  filePath: string;
  fileName: string;
  mimeType: string;
}

const DOCUMENT_QUEUE_NAME = 'document-ingestion-queue';

let documentQueue: Queue<IngestionJobData> | null = null;
let documentWorker: Worker<IngestionJobData> | null = null;

/**
 * Core processing function executed either via BullMQ or in-memory fallback
 */
export async function processDocumentJob(data: IngestionJobData): Promise<void> {
  const { documentId, userId, filePath, fileName, mimeType } = data;
  console.log(`⚡ [Ingestion Job] Starting processing for document: ${fileName} (${documentId})`);

  try {
    // 1. Extract Text (PDF parse / OCR)
    const rawText = await ingestionService.extractText(filePath, mimeType);

    // 2. Extract Metadata
    const metadata = ingestionService.extractMetadata(rawText, fileName);

    // 3. Chunk Document
    const chunks = ingestionService.chunkText(rawText, metadata.subjectTag);

    // 4. Generate Embeddings & Store Chunks
    const chunkCount = await ragService.storeChunks(documentId, userId, chunks);

    // 5. Update Document Record
    if (memStore.isPostgresReady) {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          parsedText: rawText.slice(0, 10000), // store preview/first 10k chars
          status: 'PROCESSED',
        },
      });
    } else {
      const doc = memStore.documents.get(documentId);
      if (doc) {
        doc.parsedText = rawText.slice(0, 10000);
        doc.status = 'PROCESSED';
        memStore.documents.set(documentId, doc);
      }
    }

    console.log(
      `✅ [Ingestion Job] Document successfully processed: ${fileName} | Chunks: ${chunkCount} | Subject: ${metadata.subjectTag || 'General'}`
    );
  } catch (error: any) {
    console.error(`❌ [Ingestion Job Error] Failed to process ${fileName}:`, error);

    if (memStore.isPostgresReady) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      });
    } else {
      const doc = memStore.documents.get(documentId);
      if (doc) {
        doc.status = 'FAILED';
        memStore.documents.set(documentId, doc);
      }
    }
  }
}

/**
 * Initialize BullMQ Queue and Worker if Redis is online
 */
export function initializeDocumentQueue() {
  if (isRedisConnected) {
    try {
      documentQueue = new Queue<IngestionJobData>(DOCUMENT_QUEUE_NAME, {
        connection: redisClient,
      });

      documentWorker = new Worker<IngestionJobData>(
        DOCUMENT_QUEUE_NAME,
        async (job: Job<IngestionJobData>) => {
          await processDocumentJob(job.data);
        },
        {
          connection: redisClient,
          concurrency: 3,
        }
      );

      documentWorker.on('completed', (job) => {
        console.log(`🎉 BullMQ Job ${job.id} completed successfully.`);
      });

      documentWorker.on('failed', (job, err) => {
        console.error(`💥 BullMQ Job ${job?.id} failed:`, err);
      });

      console.log('✅ BullMQ Document Ingestion Worker active on Redis.');
    } catch (err: any) {
      console.warn('BullMQ initialization deferred:', err.message);
    }
  }
}

/**
 * Dispatch document to background queue or run in-memory worker
 */
export async function dispatchDocumentIngestion(data: IngestionJobData): Promise<void> {
  if (documentQueue && isRedisConnected) {
    await documentQueue.add(`doc-${data.documentId}`, data, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: true,
    });
  } else {
    // Graceful asynchronous processing in Node.js event loop
    setImmediate(() => {
      processDocumentJob(data);
    });
  }
}
