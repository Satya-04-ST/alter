import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from '../config/env';
import { prisma, memStore, FallbackChunk } from '../config/prisma';
import { DocumentChunkResult } from './ingestionService';

export class RagService {
  private geminiAI: GoogleGenerativeAI | null = null;
  private openai: OpenAI | null = null;
  private readonly VECTOR_DIMENSION = 768;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 5) {
      this.geminiAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.length > 5) {
      this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
  }

  /**
   * Deterministic local 768-dim embedding generator for zero-API-key offline testing
   */
  private generateLocalDeterministicEmbedding(text: string): number[] {
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
  async generateEmbedding(text: string): Promise<number[]> {
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
      } catch (err: any) {
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
      } catch (err: any) {
        console.warn('OpenAI embedding failed, falling back:', err.message);
      }
    }

    // 3. Resilient Offline Local Embedding
    return this.generateLocalDeterministicEmbedding(trimmed);
  }

  private adjustDimension(values: number[], targetDim: number): number[] {
    if (values.length === targetDim) return values;
    if (values.length > targetDim) return values.slice(0, targetDim);
    const res = [...values];
    while (res.length < targetDim) res.push(0);
    return res;
  }

  /**
   * Process & Store Chunks into Vector Database
   */
  async storeChunks(
    documentId: string,
    userId: string,
    chunks: DocumentChunkResult[]
  ): Promise<number> {
    let savedCount = 0;

    for (const chunk of chunks) {
      const embedding = await this.generateEmbedding(chunk.content);
      const chunkId = `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (memStore.isPostgresReady) {
        try {
          // In pgvector, vectors are stored as string format '[0.1, 0.2, ...]'
          const vectorStr = `[${embedding.join(',')}]`;
          await prisma.$executeRaw`
            INSERT INTO "DocumentChunk" ("id", "documentId", "content", "subjectTag", "moduleIndex", "embedding", "createdAt")
            VALUES (${chunkId}, ${documentId}, ${chunk.content}, ${chunk.subjectTag || null}, ${chunk.moduleIndex || null}, ${vectorStr}::vector, NOW())
          `;
          savedCount++;
          continue;
        } catch (err: any) {
          console.warn('Postgres raw vector insert error, saving to fallback:', err.message);
        }
      }

      // Fallback Store
      const fallbackChunk: FallbackChunk = {
        id: chunkId,
        documentId,
        userId,
        content: chunk.content,
        subjectTag: chunk.subjectTag || null,
        moduleIndex: chunk.moduleIndex || null,
        embedding,
        createdAt: new Date(),
      };
      memStore.chunks.set(chunkId, fallbackChunk);
      savedCount++;
    }

    return savedCount;
  }

  /**
   * Calculate Cosine Similarity between two normalized vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(vecA.length, vecB.length);

    for (let i = 0; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Search Top-K most relevant chunks with strict userId partitioning
   */
  async searchSimilarChunks(
    userId: string,
    query: string,
    topK: number = 5,
    subjectTag?: string
  ): Promise<
    {
      id: string;
      documentId: string;
      content: string;
      subjectTag?: string | null;
      moduleIndex?: number | null;
      similarity: number;
    }[]
  > {
    const queryEmbedding = await this.generateEmbedding(query);

    if (memStore.isPostgresReady) {
      try {
        const vectorStr = `[${queryEmbedding.join(',')}]`;
        const results = await prisma.$queryRaw<
          {
            id: string;
            documentId: string;
            content: string;
            subjectTag: string | null;
            moduleIndex: number | null;
            distance: number;
          }[]
        >`
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
      } catch (err: any) {
        console.warn('pgvector search error, searching in memory store:', err.message);
      }
    }

    // Memory Store Search
    const scoredChunks: {
      id: string;
      documentId: string;
      content: string;
      subjectTag?: string | null;
      moduleIndex?: number | null;
      similarity: number;
    }[] = [];

    for (const [_, chunk] of memStore.chunks) {
      if (chunk.userId !== userId) continue;
      if (subjectTag && chunk.subjectTag !== subjectTag) continue;

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

export const ragService = new RagService();
