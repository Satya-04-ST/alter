export interface DocumentMetadata {
    subjectTag?: string;
    moduleCount?: number;
    extractedModules: {
        title: string;
        index: number;
    }[];
    detectedTopics: string[];
}
export interface DocumentChunkResult {
    content: string;
    subjectTag?: string;
    moduleIndex?: number;
    chunkIndex: number;
}
export declare class IngestionService {
    /**
     * Parse PDF, text, or Image document into sanitized text content
     */
    extractText(filePath: string, mimeType: string): Promise<string>;
    /**
     * Sanitize and format raw text into clean Markdown-like structure
     */
    sanitizeMarkdown(rawText: string): string;
    /**
     * Extract academic metadata like subject tags, modules, syllabus units
     */
    extractMetadata(text: string, fileName: string): DocumentMetadata;
    /**
     * Split document text into chunks (300-500 words/tokens, 50 token overlap)
     */
    chunkText(text: string, subjectTag?: string, chunkSize?: number, chunkOverlap?: number): DocumentChunkResult[];
}
export declare const ingestionService: IngestionService;
