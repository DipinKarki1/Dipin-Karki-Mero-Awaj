import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAwarenessArticles, createAwarenessArticle, updateAwarenessArticle, deleteAwarenessArticle } from '../controllers/awareness.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', getAwarenessArticles);
router.post('/', protect, authorize('authority', 'admin'), upload.single('image'), createAwarenessArticle);
router.put('/:id', protect, authorize('authority', 'admin'), upload.single('image'), updateAwarenessArticle);
router.delete('/:id', protect, authorize('authority', 'admin'), deleteAwarenessArticle);

export default router;
