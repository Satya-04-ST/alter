import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { documentController } from '../controllers/documentController';
import { authenticateJwt } from '../middlewares/authMiddleware';
import { env } from '../config/env';

const router = Router();

// Ensure upload directory exists
const uploadDirectory = env.UPLOAD_DIR;
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload a PDF, image, or text file.'));
    }
  },
});

// All document routes require authentication
router.use(authenticateJwt);

router.post('/upload', upload.single('file'), (req, res, next) =>
  documentController.uploadDocument(req, res, next)
);

router.get('/', (req, res, next) => documentController.getDocuments(req, res, next));
router.get('/:id', (req, res, next) => documentController.getDocumentById(req, res, next));
router.delete('/:id', (req, res, next) => documentController.deleteDocument(req, res, next));

export default router;
