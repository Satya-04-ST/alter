export interface IngestionJobData {
    documentId: string;
    userId: string;
    filePath: string;
    fileName: string;
    mimeType: string;
}
/**
 * Core processing function executed either via BullMQ or in-memory fallback
 */
export declare function processDocumentJob(data: IngestionJobData): Promise<void>;
/**
 * Initialize BullMQ Queue and Worker if Redis is online
 */
export declare function initializeDocumentQueue(): void;
/**
 * Dispatch document to background queue or run in-memory worker
 */
export declare function dispatchDocumentIngestion(data: IngestionJobData): Promise<void>;
