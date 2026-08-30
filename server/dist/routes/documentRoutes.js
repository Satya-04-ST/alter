"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const documentController_1 = require("../controllers/documentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
// Ensure upload directory exists
const uploadDirectory = env_1.env.UPLOAD_DIR;
if (!fs_1.default.existsSync(uploadDirectory)) {
    fs_1.default.mkdirSync(uploadDirectory, { recursive: true });
}
// Multer Storage Configuration
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        const cleanBase = path_1.default
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: env_1.env.MAX_FILE_SIZE_MB * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.md'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Unsupported file type. Please upload a PDF, image, or text file.'));
        }
    },
});
// All document routes require authentication
router.use(authMiddleware_1.authenticateJwt);
router.post('/upload', upload.single('file'), (req, res, next) => documentController_1.documentController.uploadDocument(req, res, next));
router.get('/', (req, res, next) => documentController_1.documentController.getDocuments(req, res, next));
router.get('/:id', (req, res, next) => documentController_1.documentController.getDocumentById(req, res, next));
router.delete('/:id', (req, res, next) => documentController_1.documentController.deleteDocument(req, res, next));
exports.default = router;
