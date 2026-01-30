import { Router } from 'express';
import {
  createSession,
  getSessions,
  getSessionById,
  deleteSession,
} from '../controllers/session.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { sessionCreationLimiter, apiLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// All session routes require authentication and rate limiting
router.use(apiLimiter);
router.use(authMiddleware);

router.post('/', sessionCreationLimiter, createSession);
router.get('/', getSessions);
router.get('/:id', getSessionById);
router.delete('/:id', deleteSession);

export default router;
