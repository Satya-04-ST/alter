"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDocumentJob = processDocumentJob;
exports.initializeDocumentQueue = initializeDocumentQueue;
exports.dispatchDocumentIngestion = dispatchDocumentIngestion;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const prisma_1 = require("../config/prisma");
const ingestionService_1 = require("../services/ingestionService");
const ragService_1 = require("../services/ragService");
const DOCUMENT_QUEUE_NAME = 'document-ingestion-queue';
let documentQueue = null;
let documentWorker = null;
/**
 * Core processing function executed either via BullMQ or in-memory fallback
 */
async function processDocumentJob(data) {
    const { documentId, userId, filePath, fileName, mimeType } = data;
    console.log(`⚡ [Ingestion Job] Starting processing for document: ${fileName} (${documentId})`);
    try {
        // 1. Extract Text (PDF parse / OCR)
        const rawText = await ingestionService_1.ingestionService.extractText(filePath, mimeType);
        // 2. Extract Metadata
        const metadata = ingestionService_1.ingestionService.extractMetadata(rawText, fileName);
        // 3. Chunk Document
        const chunks = ingestionService_1.ingestionService.chunkText(rawText, metadata.subjectTag);
        // 4. Generate Embeddings & Store Chunks
        const chunkCount = await ragService_1.ragService.storeChunks(documentId, userId, chunks);
        // 5. Update Document Record
        if (prisma_1.memStore.isPostgresReady) {
            await prisma_1.prisma.document.update({
                where: { id: documentId },
                data: {
                    parsedText: rawText.slice(0, 10000), // store preview/first 10k chars
                    status: 'PROCESSED',
                },
            });
        }
        else {
            const doc = prisma_1.memStore.documents.get(documentId);
            if (doc) {
                doc.parsedText = rawText.slice(0, 10000);
                doc.status = 'PROCESSED';
                prisma_1.memStore.documents.set(documentId, doc);
            }
        }
        console.log(`✅ [Ingestion Job] Document successfully processed: ${fileName} | Chunks: ${chunkCount} | Subject: ${metadata.subjectTag || 'General'}`);
    }
    catch (error) {
        console.error(`❌ [Ingestion Job Error] Failed to process ${fileName}:`, error);
        if (prisma_1.memStore.isPostgresReady) {
            await prisma_1.prisma.document.update({
                where: { id: documentId },
                data: { status: 'FAILED' },
            });
        }
        else {
            const doc = prisma_1.memStore.documents.get(documentId);
            if (doc) {
                doc.status = 'FAILED';
                prisma_1.memStore.documents.set(documentId, doc);
            }
        }
    }
}
/**
 * Initialize BullMQ Queue and Worker if Redis is online
 */
function initializeDocumentQueue() {
    if (redis_1.isRedisConnected) {
        try {
            documentQueue = new bullmq_1.Queue(DOCUMENT_QUEUE_NAME, {
                connection: redis_1.redisClient,
            });
            documentWorker = new bullmq_1.Worker(DOCUMENT_QUEUE_NAME, async (job) => {
                await processDocumentJob(job.data);
            }, {
                connection: redis_1.redisClient,
                concurrency: 3,
            });
            documentWorker.on('completed', (job) => {
                console.log(`🎉 BullMQ Job ${job.id} completed successfully.`);
            });
            documentWorker.on('failed', (job, err) => {
                console.error(`💥 BullMQ Job ${job?.id} failed:`, err);
            });
            console.log('✅ BullMQ Document Ingestion Worker active on Redis.');
        }
        catch (err) {
            console.warn('BullMQ initialization deferred:', err.message);
        }
    }
}
/**
 * Dispatch document to background queue or run in-memory worker
 */
async function dispatchDocumentIngestion(data) {
    if (documentQueue && redis_1.isRedisConnected) {
        await documentQueue.add(`doc-${data.documentId}`, data, {
            attempts: 2,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
        });
    }
    else {
        // Graceful asynchronous processing in Node.js event loop
        setImmediate(() => {
            processDocumentJob(data);
        });
    }
}
