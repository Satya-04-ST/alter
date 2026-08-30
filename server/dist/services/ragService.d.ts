import { DocumentChunkResult } from './ingestionService';
export declare class RagService {
    private geminiAI;
    private openai;
    private readonly VECTOR_DIMENSION;
    constructor();
    /**
     * Deterministic local 768-dim embedding generator for zero-API-key offline testing
     */
    private generateLocalDeterministicEmbedding;
    /**
     * Generate 768-dim dense embedding for a given text
     */
    generateEmbedding(text: string): Promise<number[]>;
    private adjustDimension;
    /**
     * Process & Store Chunks into Vector Database
     */
    storeChunks(documentId: string, userId: string, chunks: DocumentChunkResult[]): Promise<number>;
    /**
     * Calculate Cosine Similarity between two normalized vectors
     */
    private cosineSimilarity;
    /**
     * Search Top-K most relevant chunks with strict userId partitioning
     */
    searchSimilarChunks(userId: string, query: string, topK?: number, subjectTag?: string): Promise<{
        id: string;
        documentId: string;
        content: string;
        subjectTag?: string | null;
        moduleIndex?: number | null;
        similarity: number;
    }[]>;
}
export declare const ragService: RagService;
