import express from 'express';
import { getMessages, createMessage } from '../controllers/messages.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:issueId', protect, getMessages);
router.post('/', protect, createMessage);

export default router;
