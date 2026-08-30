"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ragService = exports.RagService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
const prisma_1 = require("../config/prisma");
class RagService {
    geminiAI = null;
    openai = null;
    VECTOR_DIMENSION = 768;
    constructor() {
        if (env_1.env.GEMINI_API_KEY && env_1.env.GEMINI_API_KEY.length > 5) {
            this.geminiAI = new generative_ai_1.GoogleGenerativeAI(env_1.env.GEMINI_API_KEY);
        }
        if (env_1.env.OPENAI_API_KEY && env_1.env.OPENAI_API_KEY.length > 5) {
            this.openai = new openai_1.default({ apiKey: env_1.env.OPENAI_API_KEY });
        }
    }
    /**
     * Deterministic local 768-dim embedding generator for zero-API-key offline testing
     */
    generateLocalDeterministicEmbedding(text) {
        const vector = new Array(this.VECTOR_DIMENSION).fill(0);
        const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        const tokens = clean.split(/\s+/).filter(Boolean);
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            let hash = 0;
            for (let j = 0; j < token.length; j++) {
                hash = (hash << 5) - hash + token.charCodeAt(j);
                hash |= 0;
            }
            const idx = Math.abs(hash) % this.VECTOR_DIMENSION;
            vector[idx] += 1.0;
            // Bigram hash
            if (i > 0) {
                const bigram = tokens[i - 1] + '_' + token;
                let biHash = 0;
                for (let k = 0; k < bigram.length; k++) {
                    biHash = (biHash << 5) - biHash + bigram.charCodeAt(k);
                    biHash |= 0;
                }
                const biIdx = Math.abs(biHash) % this.VECTOR_DIMENSION;
                vector[biIdx] += 1.5;
            }
        }
        // Normalize to unit length (L2 norm)
        let norm = 0;
        for (let i = 0; i < this.VECTOR_DIMENSION; i++) {
            norm += vector[i] * vector[i];
        }
        norm = Math.sqrt(norm);
        if (norm === 0) {
            vector[0] = 1.0;
            return vector;
        }
        for (let i = 0; i < this.VECTOR_DIMENSION; i++) {
            vector[i] = vector[i] / norm;
        }
        return vector;
    }
    /**
     * Generate 768-dim dense embedding for a given text
     */
    async generateEmbedding(text) {
        const trimmed = text.trim();
        if (!trimmed) {
            return new Array(this.VECTOR_DIMENSION).fill(0);
        }
        // 1. Try Gemini Embedding
        if (this.geminiAI) {
            try {
                const model = this.geminiAI.getGenerativeModel({ model: 'text-embedding-004' });
                const result = await model.embedContent(trimmed);
                if (result.embedding && result.embedding.values) {
                    const values = result.embedding.values;
                    if (values.length === this.VECTOR_DIMENSION) {
                        return values;
                    }
                    // Adjust dimension if needed
                    return this.adjustDimension(values, this.VECTOR_DIMENSION);
                }
            }
            catch (err) {
                console.warn('Gemini embedding failed, falling back:', err.message);
            }
        }
        // 2. Try OpenAI Embedding
        if (this.openai) {
            try {
                const response = await this.openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: trimmed,
                    dimensions: this.VECTOR_DIMENSION,
                });
                if (response.data && response.data[0]?.embedding) {
                    return response.data[0].embedding;
                }
            }
            catch (err) {
                console.warn('OpenAI embedding failed, falling back:', err.message);
            }
        }
        // 3. Resilient Offline Local Embedding
        return this.generateLocalDeterministicEmbedding(trimmed);
    }
    adjustDimension(values, targetDim) {
        if (values.length === targetDim)
            return values;
        if (values.length > targetDim)
            return values.slice(0, targetDim);
        const res = [...values];
        while (res.length < targetDim)
            res.push(0);
        return res;
    }
    /**
     * Process & Store Chunks into Vector Database
     */
    async storeChunks(documentId, userId, chunks) {
        let savedCount = 0;
        for (const chunk of chunks) {
            const embedding = await this.generateEmbedding(chunk.content);
            const chunkId = `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            if (prisma_1.memStore.isPostgresReady) {
                try {
                    // In pgvector, vectors are stored as string format '[0.1, 0.2, ...]'
                    const vectorStr = `[${embedding.join(',')}]`;
                    await prisma_1.prisma.$executeRaw `
            INSERT INTO "DocumentChunk" ("id", "documentId", "content", "subjectTag", "moduleIndex", "embedding", "createdAt")
            VALUES (${chunkId}, ${documentId}, ${chunk.content}, ${chunk.subjectTag || null}, ${chunk.moduleIndex || null}, ${vectorStr}::vector, NOW())
          `;
                    savedCount++;
                    continue;
                }
                catch (err) {
                    console.warn('Postgres raw vector insert error, saving to fallback:', err.message);
                }
            }
            // Fallback Store
            const fallbackChunk = {
                id: chunkId,
                documentId,
                userId,
                content: chunk.content,
                subjectTag: chunk.subjectTag || null,
                moduleIndex: chunk.moduleIndex || null,
                embedding,
                createdAt: new Date(),
            };
            prisma_1.memStore.chunks.set(chunkId, fallbackChunk);
            savedCount++;
        }
        return savedCount;
    }
    /**
     * Calculate Cosine Similarity between two normalized vectors
     */
    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        const len = Math.min(vecA.length, vecB.length);
        for (let i = 0; i < len; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    /**
     * Search Top-K most relevant chunks with strict userId partitioning
     */
    async searchSimilarChunks(userId, query, topK = 5, subjectTag) {
        const queryEmbedding = await this.generateEmbedding(query);
        if (prisma_1.memStore.isPostgresReady) {
            try {
                const vectorStr = `[${queryEmbedding.join(',')}]`;
                const results = await prisma_1.prisma.$queryRaw `
          SELECT 
            c."id", 
            c."documentId", 
            c."content", 
            c."subjectTag", 
            c."moduleIndex",
            (c."embedding" <=> ${vectorStr}::vector) AS distance
          FROM "DocumentChunk" c
          INNER JOIN "Document" d ON c."documentId" = d."id"
          WHERE d."userId" = ${userId}
          ${subjectTag ? `AND c."subjectTag" = ${subjectTag}` : ''}
          ORDER BY distance ASC
          LIMIT ${topK}
        `;
                return results.map((r) => ({
                    id: r.id,
                    documentId: r.documentId,
                    content: r.content,
                    subjectTag: r.subjectTag,
                    moduleIndex: r.moduleIndex,
                    similarity: 1 - (r.distance || 0),
                }));
            }
            catch (err) {
                console.warn('pgvector search error, searching in memory store:', err.message);
            }
        }
        // Memory Store Search
        const scoredChunks = [];
        for (const [_, chunk] of prisma_1.memStore.chunks) {
            if (chunk.userId !== userId)
                continue;
            if (subjectTag && chunk.subjectTag !== subjectTag)
                continue;
            const sim = chunk.embedding
                ? this.cosineSimilarity(queryEmbedding, chunk.embedding)
                : 0;
            scoredChunks.push({
                id: chunk.id,
                documentId: chunk.documentId,
                content: chunk.content,
                subjectTag: chunk.subjectTag,
                moduleIndex: chunk.moduleIndex,
                similarity: sim,
            });
        }
        scoredChunks.sort((a, b) => b.similarity - a.similarity);
        return scoredChunks.slice(0, topK);
    }
}
exports.RagService = RagService;
exports.ragService = new RagService();
