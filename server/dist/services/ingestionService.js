"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestionService = exports.IngestionService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const tesseract_js_1 = require("tesseract.js");
class IngestionService {
    /**
     * Parse PDF, text, or Image document into sanitized text content
     */
    async extractText(filePath, mimeType) {
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`File not found at path: ${filePath}`);
        }
        const ext = path_1.default.extname(filePath).toLowerCase();
        // 1. PDF Parsing
        if (mimeType.includes('pdf') || ext === '.pdf') {
            try {
                const dataBuffer = fs_1.default.readFileSync(filePath);
                const parsed = await (0, pdf_parse_1.default)(dataBuffer);
                if (parsed.text && parsed.text.trim().length > 20) {
                    return this.sanitizeMarkdown(parsed.text);
                }
                // Fallback to OCR if PDF has very little text (e.g. scanned image PDF)
                console.log('PDF text is empty or scanned. Attempting OCR...');
            }
            catch (err) {
                console.warn('pdf-parse failed, attempting OCR fallback:', err.message);
            }
        }
        // 2. Image OCR via Tesseract.js
        if (mimeType.startsWith('image/') ||
            ['.png', '.jpg', '.jpeg', '.webp', '.tiff', '.bmp'].includes(ext)) {
            try {
                const worker = await (0, tesseract_js_1.createWorker)('eng');
                const ret = await worker.recognize(filePath);
                await worker.terminate();
                return this.sanitizeMarkdown(ret.data.text);
            }
            catch (ocrErr) {
                console.error('OCR Extraction failed:', ocrErr);
                throw new Error(`OCR processing error: ${ocrErr.message}`);
            }
        }
        // 3. Plain text / Markdown
        if (mimeType.includes('text') ||
            mimeType.includes('markdown') ||
            ['.txt', '.md', '.json', '.csv'].includes(ext)) {
            const text = fs_1.default.readFileSync(filePath, 'utf-8');
            return this.sanitizeMarkdown(text);
        }
        // Default read as utf-8 fallback
        const rawContent = fs_1.default.readFileSync(filePath, 'utf-8');
        return this.sanitizeMarkdown(rawContent);
    }
    /**
     * Sanitize and format raw text into clean Markdown-like structure
     */
    sanitizeMarkdown(rawText) {
        return rawText
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\t/g, '  ')
            // Remove excessive blank lines
            .replace(/\n{3,}/g, '\n\n')
            // Clean non-printable ASCII control characters except newlines/tabs
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .trim();
    }
    /**
     * Extract academic metadata like subject tags, modules, syllabus units
     */
    extractMetadata(text, fileName) {
        const lines = text.split('\n');
        let subjectTag;
        // Detect subject from title or header lines
        const subjectPatterns = [
            /(?:course|subject|syllabus|curriculum)\s*(?:code|name)?\s*[:\-]\s*([A-Za-z0-9\s\-]+)/i,
            /([A-Z]{2,4}\s*\d{3,4}\s*[:\-]?\s*[A-Za-z\s]+)/,
        ];
        for (const line of lines.slice(0, 30)) {
            for (const pattern of subjectPatterns) {
                const match = line.match(pattern);
                if (match && match[1] && match[1].trim().length > 3) {
                    subjectTag = match[1].trim();
                    break;
                }
            }
            if (subjectTag)
                break;
        }
        if (!subjectTag) {
            // Deduce from file name
            subjectTag = fileName.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' ');
        }
        // Extract modules or units (e.g., Module 1, Unit I, Chapter 3)
        const moduleRegex = /(?:module|unit|chapter|section)\s*([0-9IVXLCDM]+)[\s:\-–—]+([^\n\r.]+)/gi;
        const extractedModules = [];
        let match;
        let idx = 1;
        while ((match = moduleRegex.exec(text)) !== null) {
            if (match[2] && match[2].trim().length > 2) {
                extractedModules.push({
                    title: `Module ${match[1]}: ${match[2].trim()}`,
                    index: idx++,
                });
            }
            if (extractedModules.length >= 20)
                break; // Limit
        }
        // Detect key academic topics
        const topicKeywords = [
            'Data Structures',
            'Algorithms',
            'Operating Systems',
            'Computer Networks',
            'Database Systems',
            'Artificial Intelligence',
            'Machine Learning',
            'Calculus',
            'Linear Algebra',
            'Discrete Mathematics',
            'Cybersecurity',
            'Software Engineering',
            'Cloud Computing',
        ];
        const detectedTopics = topicKeywords.filter((topic) => new RegExp(`\\b${topic}\\b`, 'i').test(text));
        return {
            subjectTag: subjectTag.slice(0, 80),
            moduleCount: extractedModules.length,
            extractedModules,
            detectedTopics,
        };
    }
    /**
     * Split document text into chunks (300-500 words/tokens, 50 token overlap)
     */
    chunkText(text, subjectTag, chunkSize = 400, chunkOverlap = 50) {
        const paragraphs = text.split(/\n\s*\n/);
        const words = [];
        // Tokenize into words
        for (const para of paragraphs) {
            const pWords = para.split(/\s+/).filter(Boolean);
            words.push(...pWords, '\n\n');
        }
        const chunks = [];
        let currentWordIndex = 0;
        let chunkCounter = 0;
        let currentModuleIndex = 1;
        while (currentWordIndex < words.length) {
            const sliceEnd = Math.min(currentWordIndex + chunkSize, words.length);
            const chunkWords = words.slice(currentWordIndex, sliceEnd);
            const chunkContent = chunkWords.join(' ').replace(/\s*\n\n\s*/g, '\n\n').trim();
            if (chunkContent.length > 20) {
                // Check if this chunk introduces a new module
                const moduleMatch = chunkContent.match(/(?:module|unit|chapter)\s*([0-9IVXLCDM]+)/i);
                if (moduleMatch && moduleMatch[1]) {
                    const parsedNum = parseInt(moduleMatch[1], 10);
                    if (!isNaN(parsedNum))
                        currentModuleIndex = parsedNum;
                }
                chunks.push({
                    content: chunkContent,
                    subjectTag: subjectTag,
                    moduleIndex: currentModuleIndex,
                    chunkIndex: chunkCounter++,
                });
            }
            if (sliceEnd >= words.length) {
                break;
            }
            currentWordIndex += chunkSize - chunkOverlap;
        }
        return chunks;
    }
}
exports.IngestionService = IngestionService;
exports.ingestionService = new IngestionService();
